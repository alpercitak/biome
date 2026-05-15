FROM rust:1.95-slim AS builder

WORKDIR /app

COPY daemon/Cargo.toml ./daemon/Cargo.toml
COPY daemon/Cargo.lock ./daemon/Cargo.lock

RUN mkdir -p daemon/src && \
    echo 'fn main(){}' > daemon/src/main.rs && \
    cargo build --release --manifest-path daemon/Cargo.toml && \
    rm -rf daemon/src

COPY daemon/src ./daemon/src
RUN touch daemon/src/main.rs && \
    cargo build --release --manifest-path daemon/Cargo.toml

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/daemon/target/release/biome-daemon /usr/local/bin/biome-daemon

EXPOSE 9999

CMD ["biome-daemon"]