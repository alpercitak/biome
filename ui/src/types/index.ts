export interface RawSignals {
  cpuUsage: number; // 0–100 %
  cpuFreqGhz: number; // e.g. 3.8
  memUsedGb: number;
  memTotalGb: number;
  tempC: number; // °C
  fanRpm: number;
  netUpKbps: number;
  netDownKbps: number;
}

export interface VisualSignals {
  atmosphere: number; // cpu usage    → storm / turbulence
  pulse: number; // cpu freq     → tempo of world
  ocean: number; // memory       → sea level
  thermals: number; // temperature  → drought / bloom
  wind: number; // fan speed    → wind strength
  migration: number; // network      → creature movement
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: ParticleType;
  angle: number;
  speed: number;
  hue: number;
}

export interface LightningBolt {
  segments: Array<LightningBoltSegment>;
  life: number;
}

export interface LightningBoltSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ThermalOrb {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  hue: number;
}

export interface RenderState {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  signals: VisualSignals;
  mouse: { x: number; y: number; vx: number; vy: number };
}

export type SignalSource = 'synthetic' | 'live';
export type EcosystemMode = 'calm' | 'storm' | 'drought' | 'bloom' | 'migration';
export type ParticleType = 'air' | 'creature' | 'ember';
