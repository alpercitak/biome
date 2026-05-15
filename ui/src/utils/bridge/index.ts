import type { EcosystemMode, RawSignals, SignalSource } from '../../types';
import { jitter } from '../math';
import {
  DEFAULT_SIGNALS,
  ECOSYSTEM_MODE_MAP,
  ECOSYSTEM_MODES,
  MODE_DURATION,
  POLL_MS,
  SMOOTHING_FACTOR,
  WS_URL,
} from './constants';

export class Bridge {
  raw = DEFAULT_SIGNALS;
  source: SignalSource = 'synthetic';

  private target: RawSignals = { ...this.raw };
  private modeIdx = 0;
  private modeTimer = 0;
  private ws: WebSocket | null = null;

  constructor() {
    this.#tryLive();
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

  #tryLive = (): void => {
    try {
      this.ws = new WebSocket(WS_URL);
      this.ws.onopen = () => {
        this.source = 'live';
      };
      this.ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data) as Partial<RawSignals>;
          Object.assign(this.target, d);
          if (d.memTotalGb) {
            this.raw.memTotalGb = d.memTotalGb;
          }
        } catch {
          /* skip */
        }
      };
      this.ws.onclose = () => {
        this.source = 'synthetic';
        setTimeout(() => this.#tryLive(), POLL_MS * 5);
      };
      this.ws.onerror = () => this.ws?.close();
    } catch {
      this.source = 'synthetic';
    }
  };

  tick = (): void => {
    if (this.source === 'synthetic') {
      this.modeTimer++;
      if (this.modeTimer > MODE_DURATION + Math.random() * 400) {
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
