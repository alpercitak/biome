import type { RenderState, VisualSignals } from '../../types';
import { DOM } from '../dom';
import { drawLightning } from './layers/lightning';
import { drawOcean } from './layers/ocean';
import { drawOrbs, initOrbs } from './layers/orbs';
import { drawParticles, initParticles } from './layers/particles';

export class Renderer implements RenderState {
  context: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  time = 0;
  mouse = { x: -1000, y: -1000, vx: 0, vy: 0, px: -1000, py: -1000 };
  signals: VisualSignals = { atmosphere: 0.1, pulse: 0.25, ocean: 0.4, thermals: 0.15, wind: 0.2, migration: 0.2 };

  constructor() {
    const ctx = DOM.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D not available');
    }
    this.context = ctx;

    this.#resize();
    window.addEventListener('resize', this.#resize);

    initParticles(this);
    initOrbs(this);
    this.#bindMouse();
  }

  #bindMouse = (): void => {
    document.addEventListener('mousemove', (e) => {
      this.mouse.vx = e.clientX - this.mouse.px;
      this.mouse.vy = e.clientY - this.mouse.py;
      this.mouse.px = this.mouse.x;
      this.mouse.py = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (DOM.cursor) {
        DOM.cursor.style.left = e.clientX + 'px';
        DOM.cursor.style.top = e.clientY + 'px';
      }
      setTimeout(() => {
        this.mouse.vx *= 0.5;
        this.mouse.vy *= 0.5;
      }, 50);
    });
  };

  #resize = () => {
    this.width = DOM.canvas.width = window.innerWidth;
    this.height = DOM.canvas.height = window.innerHeight;
  };

  #draw = (): void => {
    const { context, width, height } = this;

    context.fillStyle = 'rgba(0,0,0,0.12)';
    context.fillRect(0, 0, width, height);

    const heatR = Math.floor(this.signals.thermals * 35);
    const sky = context.createLinearGradient(0, 0, 0, height * 0.65);
    sky.addColorStop(0, `rgba(${2 + heatR},4,${14 - heatR},0)`);
    sky.addColorStop(1, `rgba(${4 + heatR * 2},8,20,0.05)`);
    context.fillStyle = sky;

    context.fillRect(0, 0, width, height);

    drawOrbs(this);
    drawParticles(this);
    drawLightning(this);
    drawOcean(this);
  };

  frame = (): void => {
    this.time += 0.012 + this.signals.pulse * 0.012;
    this.#draw();
  };
}
