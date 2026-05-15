import type { EcosystemMode, RawSignals, SignalSource } from '../../types';
import { DEFAULT_SIGNALS, ECOSYSTEM_MODE_MAP, ECOSYSTEM_MODES, SMOOTHING_FACTOR } from './constants';

const jitter = (v: number) => v * (1 + (Math.random() - 0.5) * 0.12);

export class Bridge {
  raw = DEFAULT_SIGNALS;
  source: SignalSource = 'synthetic';

  private target: RawSignals = { ...this.raw };
  private modeIdx = 0;
  private modeTimer = 0;
  private readonly modeDuration = 600;

  constructor() {
    this.#applyMode('calm');
  }

  get mode(): EcosystemMode {
    return ECOSYSTEM_MODES[this.modeIdx];
  }

  #applyMode = (mode: EcosystemMode): void => {
    const targetMode = ECOSYSTEM_MODE_MAP[mode];
    this.target = {
      ...targetMode,
      memTotalGb: this.raw.memTotalGb,
      cpuUsage: jitter(targetMode.cpuUsage),
      cpuFreqGhz: jitter(targetMode.cpuFreqGhz),
      memUsedGb: jitter(targetMode.memUsedGb),
      tempC: jitter(targetMode.tempC),
      fanRpm: jitter(targetMode.fanRpm),
      netUpKbps: jitter(targetMode.netUpKbps),
      netDownKbps: jitter(targetMode.netDownKbps),
    };
  };

  tick = (): void => {
    if (this.source === 'synthetic') {
      this.modeTimer++;
      if (this.modeTimer > this.modeDuration + Math.random() * 400) {
        this.modeTimer = 0;
        this.modeIdx = (this.modeIdx + 1) % ECOSYSTEM_MODES.length;
        this.#applyMode(this.mode);
      }
    }

    // Lerp raw → target
    for (const key of Object.keys(this.raw) as Array<keyof RawSignals>) {
      this.raw[key] += (this.target[key] - this.raw[key]) * SMOOTHING_FACTOR;
    }
  };
}
