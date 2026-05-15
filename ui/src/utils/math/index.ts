import { MAX_FAN_RPM, MAX_FREQ_GHZ, MAX_NET_KBPS } from '../../constants';
import type { RawSignals, VisualSignals } from '../../types';

const clamp = (v: number): number => Math.max(0, Math.min(1, v));

export const normalize = (raw: RawSignals): VisualSignals => ({
  atmosphere: clamp(raw.cpuUsage / 100),
  pulse: clamp(raw.cpuFreqGhz / MAX_FREQ_GHZ),
  ocean: clamp(raw.memUsedGb / raw.memTotalGb),
  thermals: clamp((raw.tempC - 30) / 80),
  wind: clamp(raw.fanRpm / MAX_FAN_RPM),
  migration: clamp((raw.netUpKbps + raw.netDownKbps) / MAX_NET_KBPS),
});

export const jitter = (v: number) => v * (1 + (Math.random() - 0.5) * 0.12);
