import type { RenderState } from '../../types';

const OCEAN_COLS = 80;

export const drawOcean = ({ ctx, W, H, t, signals, mouse }: RenderState): void => {
  const oceanY: Array<number> = [];

  for (let i = 0; i <= OCEAN_COLS; i++) {
    const x = i / OCEAN_COLS;
    const baseY = H * (0.62 - signals.ocean * 0.18);
    const storm = signals.atmosphere;
    const wave1 = Math.sin(x * 4 + t * 0.6) * (18 + storm * 40);
    const wave2 = Math.sin(x * 7 - t * 0.9) * (8 + storm * 20);
    const wave3 = Math.sin(x * 13 + t * 1.3) * (3 + storm * 10);
    const swell = Math.sin(x * 2 - t * 0.3) * (12 + storm * 25);
    const md = Math.abs(mouse.x / W - x);
    const ripple = Math.exp(-md * md * 30) * mouse.vy * 0.3;
    oceanY.push(baseY + wave1 + wave2 + wave3 + swell + ripple);
  }

  const minY = Math.min(...oceanY);

  // Mist
  const mist = ctx.createLinearGradient(0, minY - 40, 0, minY + 20);
  mist.addColorStop(0, 'rgba(80,140,160,0)');
  mist.addColorStop(0.5, `rgba(80,160,180,${0.04 + signals.atmosphere * 0.06})`);
  mist.addColorStop(1, 'rgba(80,140,160,0)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, minY - 40, W, 60);

  // Second wave layer
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, oceanY[0] + 8);
  for (let i = 1; i <= OCEAN_COLS; i++) ctx.lineTo((i / OCEAN_COLS) * W, oceanY[i] + 8 + Math.sin(i * 0.3 + t) * 4);
  ctx.strokeStyle = `rgba(40,120,160,${0.08 + signals.atmosphere * 0.1})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Surface
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, oceanY[0]);
  for (let i = 1; i <= OCEAN_COLS; i++) ctx.lineTo((i / OCEAN_COLS) * W, oceanY[i]);
  ctx.strokeStyle = `rgba(80,180,200,${0.15 + signals.atmosphere * 0.2})`;
  ctx.lineWidth = 1;
  ctx.shadowColor = 'rgba(80,200,220,0.4)';
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.restore();

  // Fill
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, oceanY[0]);
  for (let i = 1; i <= OCEAN_COLS; i++) ctx.lineTo((i / OCEAN_COLS) * W, oceanY[i]);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  const stB = Math.floor(signals.atmosphere * 20);
  const fill = ctx.createLinearGradient(0, H * 0.5, 0, H);
  fill.addColorStop(0, `rgba(${10 + stB},${40 + stB},${70 + stB * 2},0.75)`);
  fill.addColorStop(0.4, 'rgba(5,20,40,0.88)');
  fill.addColorStop(1, 'rgba(2,8,18,0.96)');
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();

  // Underwater drift
  for (let i = 0; i < 12; i++) {
    const px = (((t * (0.1 + i * 0.03)) % 1.2) - 0.1) * W;
    const py = H * 0.75 + Math.sin(t + i * 1.3) * H * 0.08;
    ctx.fillStyle = `rgba(100,200,220,${0.04 + signals.ocean * 0.06})`;
    ctx.beginPath();
    ctx.arc(px, py, 1 + Math.sin(t * 2 + i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
};
