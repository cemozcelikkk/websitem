// Blog kategorileri — tek kaynak. Yeni kategori eklemek için buraya bir satır ekle;
// frontmatter'daki `category` alanı buradaki `id` değerlerinden biri olmalı.
export const CATEGORIES = [
  { id: 'yapay-zeka', label: 'Yapay Zekâ' },
  { id: 'backend', label: 'Backend' },
  { id: 'devops', label: 'DevOps' },
  { id: 'guvenlik', label: 'Güvenlik' },
  { id: 'mobil', label: 'Mobil Geliştirme' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS: readonly string[] = CATEGORIES.map((c) => c.id);

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
