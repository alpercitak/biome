import type { RenderState, ThermalOrb } from '../../types';

const ORB_COUNT = 6;

const orbs: Array<ThermalOrb> = [];

export const initOrbs = ({ W, H }: RenderState): void => {
  for (let i = 0; i < ORB_COUNT; i++) {
    orbs.push({
      x: Math.random() * W,
      y: H * (0.3 + Math.random() * 0.4),
      r: 40 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0003 + Math.random() * 0.0004,
      hue: 20 + Math.random() * 40,
    });
  }
};

export const drawOrbs = ({ ctx, t, signals }: RenderState): void => {
  for (const orb of orbs) {
    orb.x += Math.sin(t * orb.speed * 1000 + orb.phase) * 0.3;
    orb.y += Math.cos(t * orb.speed * 800 + orb.phase) * 0.15;
    const intensity = signals.thermals * 0.14 + 0.02;
    const r = orb.r * (1 + signals.thermals * 0.8);
    const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
    g.addColorStop(0, `hsla(${orb.hue},80%,60%,${intensity})`);
    g.addColorStop(1, `hsla(${orb.hue},60%,30%,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
};
