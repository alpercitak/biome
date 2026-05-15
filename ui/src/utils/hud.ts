import type { EcosystemMode, RawSignal, SignalSource, VisualSignal } from '../types';
import { DOM } from './dom';

const HUD_SIGNALS = [
  {
    id: 'atmosphere',
    label: 'atmosphere',
    getValue: (r: RawSignal) => `${Math.round(r.cpuUsage)}%`,
    getNorm: (v: VisualSignal) => v.atmosphere,
  },
  {
    id: 'pulse',
    label: 'pulse',
    getValue: (r: RawSignal) => `${r.cpuFreqGhz.toFixed(1)} ghz`,
    getNorm: (v: VisualSignal) => v.pulse,
  },
  {
    id: 'ocean',
    label: 'ocean',
    getValue: (r: RawSignal) => `${r.memUsedGb.toFixed(1)} / ${r.memTotalGb.toFixed(0)} gb`,
    getNorm: (v: VisualSignal) => v.ocean,
  },
  {
    id: 'thermals',
    label: 'thermals',
    getValue: (r: RawSignal) => `${Math.round(r.tempC)}°c`,
    getNorm: (v: VisualSignal) => v.thermals,
  },
  {
    id: 'wind',
    label: 'wind',
    getValue: (r: RawSignal) => `${Math.round(r.fanRpm)} rpm`,
    getNorm: (v: VisualSignal) => v.wind,
  },
  {
    id: 'migration',
    label: 'migration',
    getValue: (r: RawSignal) => `↑${fmtNet(r.netUpKbps)} ↓${fmtNet(r.netDownKbps)}`,
    getNorm: (v: VisualSignal) => v.migration,
  },
];

const fmtNet = (kbps: number): string => (kbps >= 1000 ? `${(kbps / 1000).toFixed(1)}m` : `${Math.round(kbps)}k`);

export const updateHUD = (raw: RawSignal, visual: VisualSignal, source: SignalSource, mode: EcosystemMode): void => {
  for (const signal of HUD_SIGNALS) {
    const fill = DOM.signalFill(signal.id);
    const val = DOM.signalValue(signal.id);
    if (fill) fill.style.width = `${signal.getNorm(visual) * 100}%`;
    if (val) val.textContent = signal.getValue(raw);
  }
  DOM.mode.textContent = mode;
  DOM.source.textContent = source === 'live' ? '● live' : '○ synthetic';
};
