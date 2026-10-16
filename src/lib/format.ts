const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "2026-10-14" → "14 Ekim 2026". Sunucu ve istemcide aynı sonucu vermesi için UTC. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** "2026-10-14" → "14 Eki" */
export function formatShortDate(iso: string): string {
  return shortFormatter.format(new Date(`${iso}T00:00:00Z`));
}

export function readingLabel(minutes: number): string {
  return `${minutes} dk okuma`;
}

/** 1 → "01" */
export const pad = (n: number) => String(n).padStart(2, '0');
