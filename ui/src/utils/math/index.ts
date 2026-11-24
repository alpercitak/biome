import { MAX_FAN_RPM, MAX_FREQ_GHZ, MAX_NET_KBPS } from '../../constants';
import type { RawSignals, VisualSignals } from '../../types';

const clamp = (v: number): number => Math.max(0, Math.min(1, v));

export const normalize = (raw: RawSignals): VisualSignals => {
  const thermals = clamp((raw.tempC - 30) / 80);
  return {
    atmosphere: clamp(raw.cpuUsage / 100),
    pulse: clamp(raw.cpuFreqGhz / MAX_FREQ_GHZ),
    ocean: clamp(raw.memUsedGb / raw.memTotalGb),
    thermals,
    // The daemon reports 0 rpm where fan speed is unavailable; let heat drive the wind instead.
    wind: Math.max(clamp(raw.fanRpm / MAX_FAN_RPM), thermals),
    migration: clamp((raw.netUpKbps + raw.netDownKbps) / MAX_NET_KBPS),
  };
};

export const jitter = (v: number) => v * (1 + (Math.random() - 0.5) * 0.12);
