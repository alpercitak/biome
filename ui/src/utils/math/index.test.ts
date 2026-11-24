import { describe, expect, test } from 'bun:test';
import { MAX_FAN_RPM, MAX_FREQ_GHZ, MAX_NET_KBPS } from '../../constants';
import type { RawSignals } from '../../types';
import { jitter, normalize } from '.';

const raw = (overrides: Partial<RawSignals> = {}): RawSignals => ({
  cpuUsage: 50,
  cpuFreqGhz: MAX_FREQ_GHZ / 2,
  memUsedGb: 8,
  memTotalGb: 16,
  tempC: 70,
  fanRpm: MAX_FAN_RPM / 2,
  netUpKbps: MAX_NET_KBPS / 4,
  netDownKbps: MAX_NET_KBPS / 4,
  ...overrides,
});

describe('normalize', () => {
  test('maps raw signals onto 0–1', () => {
    expect(normalize(raw())).toEqual({
      atmosphere: 0.5,
      pulse: 0.5,
      ocean: 0.5,
      thermals: 0.5,
      wind: 0.5,
      migration: 0.5,
    });
  });

  test('clamps out-of-range values', () => {
    const high = normalize(
      raw({ cpuUsage: 150, cpuFreqGhz: 99, memUsedGb: 32, tempC: 200, fanRpm: 1e6, netUpKbps: 1e9 }),
    );
    expect(Object.values(high).every((v) => v === 1)).toBe(true);

    const low = normalize(raw({ cpuUsage: -5, cpuFreqGhz: 0, memUsedGb: 0, tempC: 0, fanRpm: 0, netUpKbps: 0, netDownKbps: 0 }));
    expect(Object.values(low).every((v) => v === 0)).toBe(true);
  });

  test('wind follows thermals when fan speed is unavailable', () => {
    const v = normalize(raw({ fanRpm: 0, tempC: 70 }));
    expect(v.wind).toBe(v.thermals);
    expect(v.wind).toBe(0.5);
  });

  test('wind uses fan speed when it exceeds thermals', () => {
    expect(normalize(raw({ fanRpm: MAX_FAN_RPM * 0.9, tempC: 30 })).wind).toBeCloseTo(0.9);
  });
});

describe('jitter', () => {
  test('stays within ±6% of the input', () => {
    for (let i = 0; i < 1000; i++) {
      const v = jitter(100);
      expect(v).toBeGreaterThanOrEqual(94);
      expect(v).toBeLessThanOrEqual(106);
    }
  });
});
