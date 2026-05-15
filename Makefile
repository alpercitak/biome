.PHONY: help dev dev-ui dev-daemon build build-ui build-daemon install clean kill

CYAN  := \033[0;36m
RESET := \033[0m

## Show this help
help:
	@echo ""
	@echo "  $(CYAN)Biome$(RESET) — living ecosystem powered by machine signals"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## Run UI + daemon concurrently
dev: 
	@echo "$(CYAN)starting biome...$(RESET)"
	@trap 'make kill' INT; \
	$(MAKE) dev-daemon & \
	sleep 1 && \
	$(MAKE) dev-ui

## Run Vite dev server (UI only, synthetic signals on http://localhost:5173)
dev-ui: 
	@echo "$(CYAN)ui$(RESET)     → http://localhost:5173"
	cd ui && bun install && bun run dev

## Build + run Rust daemon (real system signals on ws://localhost:9999)
dev-daemon: 
	@echo "$(CYAN)daemon$(RESET) → ws://localhost:9999"
	cargo run --manifest-path daemon/Cargo.toml

## Run daemon in release mode (lower CPU overhead)
dev-daemon-release: 
	cargo run --release --manifest-path daemon/Cargo.toml

## Build everything
build: build-ui build-daemon 

 ## Build UI for production (output: ui/dist)
build-ui:
	cd ui && bun run build
	@echo "$(CYAN)ui built$(RESET) → ui/dist/"

## Build daemon release binary (output: daemon/target/release/biome-daemon)
build-daemon:
	cargo build --release --manifest-path daemon/Cargo.toml
	@echo "$(CYAN)daemon built$(RESET) → daemon/target/release/biome-daemon"

## Run the release daemon binary directly
run-daemon:
	./daemon/target/release/daemon

## Kill any running daemon or vite processes
kill: 
	@pkill -f biome-daemon 2>/dev/null || true
	@pkill -f "vite" 2>/dev/null || true
	@for port in 5173 9999; do \
		lsof -ti :$$port | xargs -r kill -9; \
	done
	@echo "$(CYAN)processes stopped$(RESET)"

## Remove build artifacts
clean:
	rm -rf ui/dist daemon/target
	@echo "$(CYAN)clean$(RESET)"

 ## Type-check TS + check Rust without building
check:
	cd ui && bunx tsc --noEmit
	cargo check --manifest-path daemon/Cargo.toml