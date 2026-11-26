import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://riyooho.github.io',
  integrations: [
    tailwind({ applyBaseStyles: false }), // global.css already has the @tailwind directives
    // sitemap(),
    mdx(),
  ],
  devToolbar: {
    enabled: false,
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
