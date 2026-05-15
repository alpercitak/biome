import { Bridge } from './utils/bridge';
import { updateHUD } from './utils/hud';
import { normalize } from './utils/math';
import { Renderer } from './utils/renderer';

const bridge = new Bridge();
const renderer = new Renderer();

const loop = (): void => {
  bridge.tick();
  const visual = normalize(bridge.raw);
  renderer.signals = visual;
  renderer.frame();
  updateHUD(bridge.raw, visual, bridge.source, bridge.mode);
  requestAnimationFrame(loop);
};

loop();
