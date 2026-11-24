# Biome

Ambient visualization of live system metrics. A Rust daemon (`daemon/`) streams signals over WebSocket; a Vite + vanilla TypeScript Canvas 2D app (`ui/`) renders them. The UI falls back to synthetic signals when the daemon is offline.

## Conventions

- Use Bun for UI dependencies and package scripts; use Cargo for the daemon.
- Use the `Makefile` targets for common workflows.
- Use Conventional Commits.

## Layout

- `daemon/src/main.rs` collects metrics with `sysinfo` and broadcasts them as JSON on `ws://127.0.0.1:9999`.
- `ui/src/main.ts` runs the frame loop: bridge tick → normalize → render → HUD.
- `ui/src/utils/bridge/` owns the WebSocket connection, synthetic modes, and smoothing.
- `ui/src/utils/renderer/layers/*.ts` holds one visual layer per file, each exposing `draw*` (and `init*` when stateful).
- `ui/src/utils/<name>/index.ts` holds small focused helpers; module-specific values go in a sibling `constants.ts`.
- `ui/src/types/index.ts` holds shared types; `ui/src/constants/index.ts` holds shared normalization limits.
- Keep tuning values (counts, timings, limits) in constants rather than inline.

## Signal Contract

- The daemon's `Signals` struct (camelCase JSON) and `RawSignals` in `ui/src/types/index.ts` must stay in sync.
- `POLL_MS` exists in both the daemon and `ui/src/utils/bridge/constants.ts`; change them together.

## Rust

- Keep the daemon small and dependency-light. Code must pass `cargo fmt` and `cargo clippy -D warnings`.

## TypeScript

- Use precise types. Avoid `any`, unnecessary assertions, and non-null assertions where types can be modeled correctly.
- Keep the frame loop allocation-light; avoid per-frame DOM queries and object churn in hot paths.
- Validate WebSocket payloads at the trust boundary.

## Documentation

- Keep the README accurate when signal mappings, commands, or user-facing behavior change.

## Verification

- UI: `cd ui && bunx tsc --noEmit && bun run build`.
- Daemon: `cargo fmt --manifest-path daemon/Cargo.toml --check` and `cargo clippy --manifest-path daemon/Cargo.toml -- -D warnings`.
- Tests: `make test` (Bun's test runner for `ui/src/**/*.test.ts`, `cargo test` for the daemon).
