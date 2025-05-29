import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://tavobarrientos.github.io',
	integrations: [
		mdx(), 
		sitemap({
			filter: (page) => !page.includes('/hidden-page'),
			changefreq: 'weekly',
			lastmod: new Date(),
		})
	],
	markdown: {
		shikiConfig: {
			// Choose from Shiki's built-in themes (or add your own)
			theme: 'github-dark',
			// Add custom languages
			langs: [],
			// Enable word wrap to prevent horizontal scrolling
			wrap: true,
		},
	},
});
