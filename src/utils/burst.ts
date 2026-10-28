// Evento leve (sem importar three.js) para a cena 3D explodir partículas a cada veredito
export type BurstKind = 'correct' | 'wrong';

export const BURST_EVENT = 'hacklearn:burst';

export const triggerBurst = (kind: BurstKind) => {
  window.dispatchEvent(new CustomEvent<BurstKind>(BURST_EVENT, { detail: kind }));
};
