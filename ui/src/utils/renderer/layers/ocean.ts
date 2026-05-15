import type { RenderState } from '../../../types';

const OCEAN_COLS = 80;

export const drawOcean = (state: RenderState): void => {
  const { context, width, height, time, signals, mouse } = state;
  const oceanY: Array<number> = [];

  for (let i = 0; i <= OCEAN_COLS; i++) {
    const x = i / OCEAN_COLS;
    const baseY = height * (0.62 - signals.ocean * 0.18);
    const storm = signals.atmosphere;
    const wave1 = Math.sin(x * 4 + time * 0.6) * (18 + storm * 40);
    const wave2 = Math.sin(x * 7 - time * 0.9) * (8 + storm * 20);
    const wave3 = Math.sin(x * 13 + time * 1.3) * (3 + storm * 10);
    const swell = Math.sin(x * 2 - time * 0.3) * (12 + storm * 25);
    const md = Math.abs(mouse.x / width - x);
    const ripple = Math.exp(-md * md * 30) * mouse.vy * 0.3;
    oceanY.push(baseY + wave1 + wave2 + wave3 + swell + ripple);
  }

  const minY = Math.min(...oceanY);

  // Mist
  const mist = context.createLinearGradient(0, minY - 40, 0, minY + 20);
  mist.addColorStop(0, 'rgba(80,140,160,0)');
  mist.addColorStop(0.5, `rgba(80,160,180,${0.04 + signals.atmosphere * 0.06})`);
  mist.addColorStop(1, 'rgba(80,140,160,0)');
  context.fillStyle = mist;
  context.fillRect(0, minY - 40, width, 60);

  // Second wave layer
  context.save();
  context.beginPath();
  context.moveTo(0, oceanY[0] + 8);
  for (let i = 1; i <= OCEAN_COLS; i++) {
    context.lineTo((i / OCEAN_COLS) * width, oceanY[i] + 8 + Math.sin(i * 0.3 + time) * 4);
  }
  context.strokeStyle = `rgba(40,120,160,${0.08 + signals.atmosphere * 0.1})`;
  context.lineWidth = 1;
  context.stroke();
  context.restore();

  // Surface
  context.save();
  context.beginPath();
  context.moveTo(0, oceanY[0]);
  for (let i = 1; i <= OCEAN_COLS; i++) {
    context.lineTo((i / OCEAN_COLS) * width, oceanY[i]);
  }
  context.strokeStyle = `rgba(80,180,200,${0.15 + signals.atmosphere * 0.2})`;
  context.lineWidth = 1;
  context.shadowColor = 'rgba(80,200,220,0.4)';
  context.shadowBlur = 6;
  context.stroke();
  context.restore();

  // Fill
  context.save();
  context.beginPath();
  context.moveTo(0, oceanY[0]);
  for (let i = 1; i <= OCEAN_COLS; i++) {
    context.lineTo((i / OCEAN_COLS) * width, oceanY[i]);
  }
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  const stB = Math.floor(signals.atmosphere * 20);
  const fill = context.createLinearGradient(0, height * 0.5, 0, height);
  fill.addColorStop(0, `rgba(${10 + stB},${40 + stB},${70 + stB * 2},0.75)`);
  fill.addColorStop(0.4, 'rgba(5,20,40,0.88)');
  fill.addColorStop(1, 'rgba(2,8,18,0.96)');
  context.fillStyle = fill;
  context.fill();
  context.restore();

  // Underwater drift
  for (let i = 0; i < 12; i++) {
    const px = (((time * (0.1 + i * 0.03)) % 1.2) - 0.1) * width;
    const py = height * 0.75 + Math.sin(time + i * 1.3) * height * 0.08;
    context.fillStyle = `rgba(100,200,220,${0.04 + signals.ocean * 0.06})`;
    context.beginPath();
    context.arc(px, py, 1 + Math.sin(time * 2 + i) * 0.5, 0, Math.PI * 2);
    context.fill();
  }
};
