import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.7thstreetgarage.com',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (p) => !p.includes('/404') })],
});
