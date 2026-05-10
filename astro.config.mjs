import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://riyooho.github.io/riyooho.github.io',
  base: '/riyooho.github.io',
  integrations: [
    tailwind(),
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
