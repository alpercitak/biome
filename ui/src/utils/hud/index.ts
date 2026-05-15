import type { EcosystemMode, RawSignals, SignalSource, VisualSignals } from '../../types';
import { DOM } from '../dom';

const HUD_SIGNALS = [
  {
    id: 'atmosphere',
    label: 'atmosphere',
    getValue: (r: RawSignals) => `${Math.round(r.cpuUsage)}%`,
    getNorm: (v: VisualSignals) => v.atmosphere,
  },
  {
    id: 'pulse',
    label: 'pulse',
    getValue: (r: RawSignals) => `${r.cpuFreqGhz.toFixed(1)} ghz`,
    getNorm: (v: VisualSignals) => v.pulse,
  },
  {
    id: 'ocean',
    label: 'ocean',
    getValue: (r: RawSignals) => `${r.memUsedGb.toFixed(1)} / ${r.memTotalGb.toFixed(0)} gb`,
    getNorm: (v: VisualSignals) => v.ocean,
  },
  {
    id: 'thermals',
    label: 'thermals',
    getValue: (r: RawSignals) => `${Math.round(r.tempC)}°c`,
    getNorm: (v: VisualSignals) => v.thermals,
  },
  {
    id: 'wind',
    label: 'wind',
    getValue: (r: RawSignals) => `${Math.round(r.fanRpm)} rpm`,
    getNorm: (v: VisualSignals) => v.wind,
  },
  {
    id: 'migration',
    label: 'migration',
    getValue: (r: RawSignals) => `↑${fmtNet(r.netUpKbps)} ↓${fmtNet(r.netDownKbps)}`,
    getNorm: (v: VisualSignals) => v.migration,
  },
];

const fmtNet = (kbps: number): string => (kbps >= 1000 ? `${(kbps / 1000).toFixed(1)}m` : `${Math.round(kbps)}k`);

export const updateHUD = (raw: RawSignals, visual: VisualSignals, source: SignalSource, mode: EcosystemMode): void => {
  for (const signal of HUD_SIGNALS) {
    const fill = DOM.signalFill(signal.id);
    const val = DOM.signalValue(signal.id);
    if (fill) fill.style.width = `${signal.getNorm(visual) * 100}%`;
    if (val) val.textContent = signal.getValue(raw);
  }
  DOM.mode.textContent = mode;
  DOM.source.textContent = source === 'live' ? '● live' : '○ synthetic';
};
