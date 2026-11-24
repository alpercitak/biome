import { Bridge } from './utils/bridge';
import { updateHUD } from './utils/hud';
import { normalize } from './utils/math';
import { Renderer } from './utils/renderer';

const bridge = new Bridge();
const renderer = new Renderer();

// Simulation constants are tuned per 60fps frame; scale by elapsed frames so speed
// doesn't depend on refresh rate. Capped so a backgrounded tab doesn't jump on return.
const FRAME_MS = 1000 / 60;
const MAX_STEP = 3;
let last = performance.now();

const loop = (now: number): void => {
  const step = Math.min((now - last) / FRAME_MS, MAX_STEP);
  last = now;
  bridge.tick(step);
  const visual = normalize(bridge.raw);
  renderer.signals = visual;
  renderer.frame(step);
  updateHUD(bridge.raw, visual, bridge.source, bridge.mode, bridge.unavailable);
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
