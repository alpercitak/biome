use std::{net::SocketAddr, time::Duration};

use futures_util::{SinkExt, StreamExt};
use serde::Serialize;
use sysinfo::{Components, Networks, System};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_tungstenite::{
    accept_hdr_async,
    tungstenite::{
        Message,
        handshake::server::{ErrorResponse, Request, Response},
        http::StatusCode,
    },
};

const ADDR: &str = "127.0.0.1:9999";
const POLL_MS: u64 = 800;
const CHAN_CAP: usize = 8;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Signals {
    cpu_usage: f32,
    cpu_freq_ghz: f32,
    mem_used_gb: f32,
    mem_total_gb: f32,
    temp_c: f32,
    fan_rpm: f32,
    net_up_kbps: f32,
    net_down_kbps: f32,
}

struct Collector {
    sys: System,
    networks: Networks,
    components: Components,
}

impl Collector {
    fn new() -> Self {
        let mut sys = System::new().expect("failed to initialize sysinfo");
        sys.refresh_cpu_all();
        sys.refresh_memory();
        Self {
            sys,
            networks: Networks::new_with_refreshed_list().expect("failed to list networks"),
            components: Components::new_with_refreshed_list().expect("failed to list components"),
        }
    }

    fn collect(&mut self) -> Signals {
        self.sys.refresh_cpu_all();
        self.sys.refresh_memory();
        self.networks.refresh(true);
        self.components.refresh(true);

        let cpu_usage =
            self.sys.cpus().iter().map(|c| c.usage()).sum::<f32>() / self.sys.cpus().len() as f32;

        let cpu_freq_ghz = self
            .sys
            .cpus()
            .iter()
            .map(|c| c.frequency() as f32)
            .sum::<f32>()
            / self.sys.cpus().len() as f32
            / 1000.0;

        let mem_total_gb = self.sys.total_memory() as f32 / 1_073_741_824.0;
        let mem_used_gb = self.sys.used_memory() as f32 / 1_073_741_824.0;

        let temp_c = self
            .components
            .iter()
            .find(|c| {
                let l = c.label().to_lowercase();
                l.contains("cpu") || l.contains("package") || l.contains("tdie")
            })
            .and_then(|c| c.temperature())
            .unwrap_or(0.0);

        // transmitted()/received() are already bytes since the previous refresh.
        let (delta_up, delta_down) = self.networks.iter().fold((0u64, 0u64), |(u, d), (_, n)| {
            (u + n.transmitted(), d + n.received())
        });
        let s = POLL_MS as f32 / 1000.0;

        Signals {
            cpu_usage,
            cpu_freq_ghz,
            mem_used_gb,
            mem_total_gb,
            temp_c,
            fan_rpm: 0.0, // platform-specific; UI falls back to thermal signal
            net_up_kbps: delta_up as f32 / 1024.0 / s,
            net_down_kbps: delta_down as f32 / 1024.0 / s,
        }
    }
}

/// Browsers always send Origin; without this check any website could read the metrics.
/// Requests without Origin come from non-browser clients and are allowed.
fn is_allowed_origin(origin: &str) -> bool {
    let Some(rest) = origin
        .strip_prefix("http://")
        .or_else(|| origin.strip_prefix("https://"))
    else {
        return false;
    };
    let host = match rest.rsplit_once(':') {
        Some((host, port)) if port.bytes().all(|b| b.is_ascii_digit()) => host,
        _ => rest,
    };
    matches!(host, "localhost" | "127.0.0.1" | "[::1]")
}

#[allow(clippy::result_large_err)] // signature required by tungstenite's handshake callback
fn check_origin(req: &Request, resp: Response) -> Result<Response, ErrorResponse> {
    match req.headers().get("origin").map(|o| o.to_str()) {
        None => Ok(resp),
        Some(Ok(origin)) if is_allowed_origin(origin) => Ok(resp),
        _ => {
            let mut err = ErrorResponse::new(None);
            *err.status_mut() = StatusCode::FORBIDDEN;
            Err(err)
        }
    }
}

async fn handle(stream: TcpStream, addr: SocketAddr, mut rx: broadcast::Receiver<String>) {
    let ws = match accept_hdr_async(stream, check_origin).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("[biome] handshake {addr}: {e}");
            return;
        }
    };
    println!("[biome] + {addr}");
    let (mut sink, mut source) = ws.split();
    loop {
        tokio::select! {
            msg = rx.recv() => match msg {
                Ok(json) => { if sink.send(Message::Text(json.into())).await.is_err() { break; } }
                Err(broadcast::error::RecvError::Lagged(_)) => continue,
                Err(_) => break,
            },
            frame = source.next() => match frame {
                Some(Ok(Message::Close(_))) | None => break,
                _ => {}
            }
        }
    }
    println!("[biome] - {addr}");
}

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind(ADDR).await.expect("bind failed");
    println!("[biome] daemon ws://{ADDR}");
    let (tx, _) = broadcast::channel::<String>(CHAN_CAP);
    {
        let tx = tx.clone();
        tokio::spawn(async move {
            let mut collector = Collector::new();
            loop {
                let json = serde_json::to_string(&collector.collect()).unwrap();
                let _ = tx.send(json);
                tokio::time::sleep(Duration::from_millis(POLL_MS)).await;
            }
        });
    }
    loop {
        match listener.accept().await {
            Ok((stream, addr)) => {
                let rx = tx.subscribe();
                tokio::spawn(handle(stream, addr, rx));
            }
            Err(e) => eprintln!("[biome] accept: {e}"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(origin: Option<&str>) -> Request {
        let mut builder = Request::builder().uri("/");
        if let Some(origin) = origin {
            builder = builder.header("origin", origin);
        }
        builder.body(()).unwrap()
    }

    #[test]
    fn allows_local_origins() {
        for origin in [
            "http://localhost",
            "http://localhost:5173",
            "https://localhost:4173",
            "http://127.0.0.1:5173",
            "http://[::1]",
            "http://[::1]:5173",
        ] {
            assert!(is_allowed_origin(origin), "{origin}");
        }
    }

    #[test]
    fn rejects_other_origins() {
        for origin in [
            "https://evil.example",
            "http://localhost.evil.com",
            "http://evil.com:localhost",
            "http://127.0.0.1.evil.com",
            "ws://localhost:5173",
            "localhost:5173",
            "null",
            "",
        ] {
            assert!(!is_allowed_origin(origin), "{origin}");
        }
    }

    #[test]
    fn handshake_allows_missing_or_local_origin() {
        assert!(check_origin(&request(None), Response::new(())).is_ok());
        assert!(check_origin(&request(Some("http://localhost:5173")), Response::new(())).is_ok());
    }

    #[test]
    fn handshake_rejects_foreign_origin_with_403() {
        let err =
            check_origin(&request(Some("https://evil.example")), Response::new(())).unwrap_err();
        assert_eq!(err.status(), StatusCode::FORBIDDEN);
    }
}
