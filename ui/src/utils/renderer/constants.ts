import type { MousePosition, VisualSignals } from '../../types';

export const DEFAULT_SIGNALS = {
  atmosphere: 0.1,
  pulse: 0.25,
  ocean: 0.4,
  thermals: 0.15,
  wind: 0.2,
  migration: 0.2,
} satisfies VisualSignals;

export const DEFAULT_MOUSE = {
  x: -1000,
  y: -1000,
  vx: 0,
  vy: 0,
  px: -1000,
  py: -1000,
} satisfies MousePosition;
