import type { LightningBolt, LightningBoltSegment, RenderState } from '../../types';

const lightningBolts: Array<LightningBolt> = [];

let nextLightning = 0;

export const drawLightning = ({ ctx, t, signals, W, H }: RenderState): void => {
  if (t * 1000 > nextLightning && signals.atmosphere > 0.5) {
    const segments: Array<LightningBoltSegment> = [];
    let cx = Math.random() * W;
    let cy = 0;
    while (cy < H * 0.45) {
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
    nextLightning = t * 1000 + 800 + (Math.random() * 3000) / signals.atmosphere;
  }

  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const l = lightningBolts[i];
    l.life -= 0.08;
    if (l.life <= 0) {
      lightningBolts.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = l.life * 0.8;
    ctx.strokeStyle = `rgba(180,200,255,${l.life})`;
    ctx.lineWidth = 0.5 + l.life;
    ctx.shadowColor = 'rgba(150,180,255,0.8)';
    ctx.shadowBlur = 8;
    for (const seg of l.segments) {
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    ctx.restore();
    if (l.life > 0.85) {
      ctx.fillStyle = `rgba(180,210,255,${(l.life - 0.85) * 0.05})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
};
