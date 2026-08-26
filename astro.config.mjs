import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  site: 'https://tavobarrientos.github.io',

  // KEPT at the Astro 6 behaviour. Astro 7 defaults this to 'jsx', which
  // strips whitespace between inline elements using JSX rules. That was
  // tried and reverted: it silently dropped the space in the footer's
  // "personally and through Ambystech" and before several inline <span>s.
  // Markdown prose is unaffected, but component templates are not, and
  // there is no advisory or security reason to accept the regression.
  compressHTML: true,

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/hidden-page'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }), 
    icon()
  ],

  markdown: {
      // PINNED to the Astro 6 default. Astro 7 makes Satteri the default
      // markdown processor. Flipped separately so its diff is reviewable.
      processor: unified(),
      shikiConfig: {
          theme: 'github-dark',
          // Add custom languages
          langs: [],
          // Enable word wrap to prevent horizontal scrolling
          wrap: true,
      },
    },

  vite: {
    plugins: [tailwindcss()],
  },
});