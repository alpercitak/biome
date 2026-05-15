import type { LightningBolt, LightningBoltSegment, RenderState } from '../../../types';

const lightningBolts: Array<LightningBolt> = [];

let nextLightning = 0;

export const drawLightning = (state: RenderState): void => {
  const { context, time, signals, width, height } = state;
  if (time * 1000 > nextLightning && signals.atmosphere > 0.5) {
    const segments: Array<LightningBoltSegment> = [];
    let cx = Math.random() * width;
    let cy = 0;
    while (cy < height * 0.45) {
      const nx = cx + (Math.random() - 0.5) * 60;
      const ny = cy + 20 + Math.random() * 30;
      segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
      cx = nx;
      cy = ny;
      if (Math.random() < 0.3) {
        segments.push({ x1: cx, y1: cy, x2: cx + (Math.random() - 0.5) * 40, y2: cy + 10 + Math.random() * 20 });
      }
    }
    lightningBolts.push({ segments, life: 1 });
    nextLightning = time * 1000 + 800 + (Math.random() * 3000) / signals.atmosphere;
  }

  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const l = lightningBolts[i];
    l.life -= 0.08;
    if (l.life <= 0) {
      lightningBolts.splice(i, 1);
      continue;
    }
    context.save();
    context.globalAlpha = l.life * 0.8;
    context.strokeStyle = `rgba(180,200,255,${l.life})`;
    context.lineWidth = 0.5 + l.life;
    context.shadowColor = 'rgba(150,180,255,0.8)';
    context.shadowBlur = 8;
    for (const segment of l.segments) {
      context.beginPath();
      context.moveTo(segment.x1, segment.y1);
      context.lineTo(segment.x2, segment.y2);
      context.stroke();
    }
    context.restore();
    if (l.life > 0.85) {
      context.fillStyle = `rgba(180,210,255,${(l.life - 0.85) * 0.05})`;
      context.fillRect(0, 0, width, height);
    }
  }
};
