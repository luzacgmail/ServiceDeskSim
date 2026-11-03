export const emit = (type: string, detail: Record<string, unknown> = {}) => window.dispatchEvent(new CustomEvent('sd', { detail: { type, ...detail } }));
