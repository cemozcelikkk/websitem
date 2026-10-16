import type { CategoryId } from './categories.ts';

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Yazının liste ve meta bilgisi (gövde hariç). Tarihler YYYY-AA-GG biçiminde. */
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** Taslaklarda tarih zorunlu değil. */
  date: string | null;
  updatedAt?: string;
  category: CategoryId;
  tags: string[];
  featured: boolean;
  draft: boolean;
  series?: string;
  seriesOrder?: number;
  relatedProject?: string;
  repositoryUrl?: string;
  coverImage?: string;
  readingMinutes: number;
}

export interface PostBody {
  html: string;
  toc: TocItem[];
  hasMermaid: boolean;
}

/** Hiyerarşik rehberin bir bölümü: /blog/<topic>/<slug> */
export interface ChapterMeta {
  slug: string;
  topic: string;
  title: string;
  /** Breadcrumb'da görünen kısa ad (ör. "Kurulum"). Verilmezse title kullanılır. */
  shortTitle?: string;
  description: string;
  order: number;
  category: CategoryId;
  draft: boolean;
  date?: string;
  updatedAt?: string;
  readingMinutes: number;
}

/** Rehber konusu (ör. Ubuntu): /blog/<slug>. Bölümler `order` değerine göre sıralı. */
export interface GuideTopic {
  slug: string;
  title: string;
  description: string;
  order: number;
  draft: boolean;
  /** index.md gövdesi (konu girişi). Boş olabilir. */
  html: string;
  chapters: ChapterMeta[];
}

export interface Project {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  url?: string;
  repositoryUrl?: string;
  stack: string[];
  notes: string[];
  order: number;
  /** Markdown gövdesi (problem, mimari, zorluklar…). Boş olabilir. */
  html: string;
  toc: TocItem[];
}
