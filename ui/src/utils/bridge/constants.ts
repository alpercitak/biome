import type { EcosystemMode, RawSignals } from '../../types';

export const WS_URL = 'ws://localhost:9999';
export const POLL_MS = 800;

export const SMOOTHING_FACTOR = 0.004;

export const DEFAULT_SIGNALS = {
  cpuUsage: 10,
  cpuFreqGhz: 1.4,
  memUsedGb: 6,
  memTotalGb: 16,
  tempC: 45,
  fanRpm: 1400,
  netUpKbps: 30,
  netDownKbps: 100,
} satisfies RawSignals;

export const ECOSYSTEM_MODES: ReadonlyArray<EcosystemMode> = ['calm', 'storm', 'drought', 'bloom', 'migration'];

export const ECOSYSTEM_MODE_MAP = {
  calm: { cpuUsage: 8, cpuFreqGhz: 1.2, memUsedGb: 5, tempC: 42, fanRpm: 1200, netUpKbps: 20, netDownKbps: 80 },
  storm: { cpuUsage: 85, cpuFreqGhz: 4.2, memUsedGb: 13, tempC: 88, fanRpm: 4800, netUpKbps: 800, netDownKbps: 2400 },
  drought: { cpuUsage: 22, cpuFreqGhz: 2.1, memUsedGb: 7, tempC: 96, fanRpm: 5200, netUpKbps: 10, netDownKbps: 30 },
  bloom: { cpuUsage: 35, cpuFreqGhz: 3.0, memUsedGb: 11, tempC: 65, fanRpm: 2800, netUpKbps: 600, netDownKbps: 1800 },
  migration: {
    cpuUsage: 28,
    cpuFreqGhz: 2.6,
    memUsedGb: 9,
    tempC: 55,
    fanRpm: 2000,
    netUpKbps: 2400,
    netDownKbps: 8000,
  },
} as const satisfies Record<EcosystemMode, Omit<RawSignals, 'memTotalGb'>>;
