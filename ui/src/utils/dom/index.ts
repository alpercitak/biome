const mustGet = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing DOM element: ${id}`);
  }
  return el as T;
};

export const DOM = {
  canvas: mustGet<HTMLCanvasElement>('b-canvas'),
  cursor: mustGet<HTMLDivElement>('b-cursor'),
  mode: mustGet<HTMLDivElement>('b-mode'),
  source: mustGet<HTMLDivElement>('b-source'),
  signalFill: (id: string) => mustGet<HTMLDivElement>(`b-signal-fill-${id}`),
  signalValue: (id: string) => mustGet<HTMLDivElement>(`b-signal-value-${id}`),
} as const;
