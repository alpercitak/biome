import type { Particle, RenderState } from '../../../types';

const PARTICLE_COUNT = 320;

const particles: Array<Particle> = [];

const createParticle = (state: RenderState, i: number): Particle => ({
  x: Math.random() * state.width,
  y: Math.random() * state.width,
  vx: (Math.random() - 0.5) * 0.3,
  vy: -Math.random() * 0.4 - 0.1,
  life: Math.random(),
  maxLife: 0.6 + Math.random() * 0.4,
  size: 0.5 + Math.random() * 1.5,
  type: i < 200 ? 'air' : i < 260 ? 'creature' : 'ember',
  angle: Math.random() * Math.PI * 2,
  speed: 0.2 + Math.random() * 0.5,
  hue: 180 + Math.random() * 60,
});

export const initParticles = (state: RenderState): void => {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(state, i));
  }
};

export const drawParticles = (state: RenderState): void => {
  const { context, time, signals, mouse, width, height } = state;
  const storm = signals.atmosphere;
  const mig = signals.migration;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (p.type === 'air') {
      p.vx += (Math.random() - 0.5) * 0.05 * (1 + storm * 4);
      p.vy += -0.02 - storm * 0.08 + (Math.random() - 0.5) * 0.03;
      p.vx += Math.sin(time * 0.5 + p.y * 0.003) * 0.02 * (1 + storm);
      p.vx += signals.wind * 0.04;
    } else if (p.type === 'creature') {
      p.angle += (Math.random() - 0.5) * 0.2 * (0.5 + mig * 2);
      p.vx += Math.cos(p.angle) * p.speed * mig * 0.15;
      p.vy += Math.sin(p.angle) * p.speed * mig * 0.1 - 0.02;
    } else {
      p.vx += (Math.random() - 0.5) * 0.08;
      p.vy -= 0.05 + signals.thermals * 0.12;
      p.hue = 20 + signals.thermals * 30;
    }

    // Mouse repulsion
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80 && dist > 0) {
      const f = (80 - dist) / 80;
      p.vx += (dx / dist) * f * 0.8;
      p.vy += (dy / dist) * f * 0.8;
    }

    p.vx *= 0.97;
    p.vy *= 0.97;
    p.x += p.vx;
    p.y += p.vy;
    p.life += 0.003;

    if (p.life > p.maxLife || p.x < -10 || p.x > width + 10 || p.y < -20) {
      Object.assign(p, createParticle(state, i));
      p.x = Math.random() * width;
      p.y = height * 0.5 + Math.random() * height * 0.2;
      p.life = 0;
      continue;
    }

    const alpha =
      Math.sin((p.life / p.maxLife) * Math.PI) * (p.type === 'creature' ? 0.4 + mig * 0.4 : 0.15 + storm * 0.25);
    if (alpha <= 0.005) {
      continue;
    }

    if (p.type === 'creature') {
      context.save();
      context.strokeStyle = `hsla(${140 + mig * 60},70%,65%,${alpha})`;
      context.lineWidth = p.size * 0.8;
      context.beginPath();
      context.moveTo(p.x, p.y);
      context.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
      context.stroke();
      context.restore();
    } else {
      context.fillStyle = p.type === 'air' ? `hsla(210,60%,75%,${alpha})` : `hsla(${p.hue},90%,65%,${alpha})`;
      context.beginPath();
      context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      context.fill();
    }
  }
};
