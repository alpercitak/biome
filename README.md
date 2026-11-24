# Biome

![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=flat-square&logo=typescript&logoColor=3178C6)
![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=flat-square&logo=socketdotio&logoColor=white)
![Build](https://img.shields.io/github/actions/workflow/status/alpercitak/biome/build.yaml?style=flat-square&label=&color=2ea44f)
![License](https://img.shields.io/badge/MIT-2ea44f?style=flat-square)

A living ecosystem powered by your machine's invisible activity.

CPU usage becomes storms. Memory pressure raises tides. Network traffic drives migrations. Thermals spread drought and bloom.
Not a dashboard. Not a monitor. A sensory translation layer for computation.

---

## How it works

A Rust daemon reads live system signals and streams them over a local WebSocket. 

The browser receives them and maps each value into an environmental behavior; storm intensity, ocean level, creature movement, thermal glow. 

When the daemon isn't running, the UI falls back to a procedural simulation that cycles through ecosystem states autonomously.

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  biome-daemon   │ ─────────────────► │    biome-ui      │
│  Rust + sysinfo │   ws://localhost   │  TypeScript +    │
│  ~800ms polling │      :9999         │  Canvas 2D       │
└─────────────────┘                    └──────────────────┘
```

### Signal mapping

| System signal   | Ecosystem effect         |
|-----------------|--------------------------|
| CPU usage       | Storm intensity, lightning |
| CPU frequency   | World tempo              |
| Memory pressure | Ocean level and tides    |
| Temperature     | Thermal glow, drought    |
| Fan speed       | Wind, particle drift     |
| Network I/O     | Creature migrations      |

Fan speed is read on Linux (hwmon). Where it or temperature can't be read, the HUD shows `n/a`, and wind follows temperature when there's no fan reading.

---

## Stack

**Daemon** — Rust, Tokio, tokio-tungstenite, sysinfo  
**UI** — TypeScript, Vite, Canvas 2D  
**Infra** — Docker Compose, Nginx

---

## Running locally

### Dev mode

```bash
# UI only — synthetic signals, no daemon needed
make dev-ui

# Daemon only
make dev-daemon

# Both together
make dev
```

UI runs at `http://localhost:5173`.  
Daemon streams signals at `ws://localhost:9999`.

### Production build

```bash
make build
```

Output: `ui/dist/` (static) and `daemon/target/release/biome-daemon` (binary).

---

## Docker

```bash
docker compose up
```

Opens at `http://localhost:5173`.

The UI container serves the static app; your browser connects directly to the daemon at `ws://localhost:9999`. The daemon uses host networking so it can read host metrics on Linux. On macOS and Windows (Docker Desktop) it reports the Docker VM's metrics instead — run `make dev-daemon` natively for real values.

```bash
# Build only
docker compose build

# Detached
docker compose up -d

# Stop
docker compose down
```

---

## Design principles

Biome should feel organic, ambient, cinematic. The visuals reach toward weather, oceans, and living systems rather than productivity software. There are no graphs. No alerts. No numbers you need to act on.

The machine becomes something you observe rather than operate.

---

## License

MIT
