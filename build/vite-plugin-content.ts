// İçeriği uygulamaya sanal modüller olarak sunar:
//   virtual:content              → yazı listesi (gövdesiz), projeler, gövde yükleyicileri
//   virtual:content/post/<slug>  → tek yazının HTML gövdesi (ayrı chunk, ihtiyaç olunca yüklenir)
//   virtual:content/guide/<konu>/<bölüm> → rehber bölümünün HTML gövdesi (ayrı chunk)
import path from 'node:path';
import type { Plugin } from 'vite';
import { loadContent, type LoadedContent } from './content.ts';

const INDEX_ID = 'virtual:content';
const POST_PREFIX = 'virtual:content/post/';
const GUIDE_PREFIX = 'virtual:content/guide/';

export function contentPlugin(options: { contentDir: string; includeDrafts: boolean }): Plugin {
  const contentDir = path.resolve(options.contentDir);
  let cache: Promise<LoadedContent> | undefined;
  const getContent = () => (cache ??= loadContent(contentDir, { includeDrafts: options.includeDrafts }));

  return {
    name: 'site-content',

    buildStart() {
      cache = undefined;
    },

    resolveId(id) {
      if (id === INDEX_ID || id.startsWith(POST_PREFIX) || id.startsWith(GUIDE_PREFIX)) return `\0${id}`;
    },

    async load(id) {
      if (!id.startsWith(`\0${INDEX_ID}`)) return;
      let content: LoadedContent;
      try {
        content = await getContent();
      } catch (error) {
        cache = undefined;
        this.error(error instanceof Error ? error.message : String(error));
      }

      if (id === `\0${INDEX_ID}`) {
        const loaders = content.posts
          .map((p) => `  ${JSON.stringify(p.meta.slug)}: () => import(${JSON.stringify(POST_PREFIX + p.meta.slug)}),`)
          .join('\n');
        const chapterLoaders = content.guides
          .flatMap((g) => g.chapters.map((c) => `${g.topic.slug}/${c.meta.slug}`))
          .map((key) => `  ${JSON.stringify(key)}: () => import(${JSON.stringify(GUIDE_PREFIX + key)}),`)
          .join('\n');
        return [
          `export const showDrafts = ${JSON.stringify(options.includeDrafts)};`,
          `export const posts = ${JSON.stringify(content.posts.map((p) => p.meta))};`,
          `export const projects = ${JSON.stringify(content.projects)};`,
          `export const postLoaders = {\n${loaders}\n};`,
          `export const guides = ${JSON.stringify(content.guides.map((g) => g.topic))};`,
          `export const chapterLoaders = {\n${chapterLoaders}\n};`,
        ].join('\n');
      }

      if (id.startsWith(`\0${GUIDE_PREFIX}`)) {
        const [topic, chapter] = id.slice(`\0${GUIDE_PREFIX}`.length).split('/');
        const found = content.guides.find((g) => g.topic.slug === topic)?.chapters.find((c) => c.meta.slug === chapter);
        if (!found) this.error(`Rehber bölümü bulunamadı: ${topic}/${chapter}`);
        return `export default ${JSON.stringify(found.body)};`;
      }

      const slug = id.slice(`\0${POST_PREFIX}`.length);
      const post = content.posts.find((p) => p.meta.slug === slug);
      if (!post) this.error(`Yazı bulunamadı: ${slug}`);
      return `export default ${JSON.stringify(post.body)};`;
    },

    configureServer(server) {
      server.watcher.add(contentDir);
      const onChange = (file: string) => {
        if (!path.resolve(file).startsWith(contentDir)) return;
        cache = undefined;
        for (const env of Object.values(server.environments)) {
          for (const [id, mod] of env.moduleGraph.idToModuleMap) {
            if (id.startsWith(`\0${INDEX_ID}`)) env.moduleGraph.invalidateModule(mod);
          }
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
