declare module 'virtual:content' {
  export const showDrafts: boolean;
  export const posts: import('./content/types').PostMeta[];
  export const projects: import('./content/types').Project[];
  export const postLoaders: Record<string, () => Promise<{ default: import('./content/types').PostBody }>>;
  export const guides: import('./content/types').GuideTopic[];
  /** Anahtar: "<konu>/<bölüm>" */
  export const chapterLoaders: Record<string, () => Promise<{ default: import('./content/types').PostBody }>>;
}
