# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and blog website built with Astro, deployed to GitHub Pages and served from the custom domain https://barrientos.io (set via `public/CNAME`; the github.io host 301-redirects there). The site features technical blog posts, project showcases, and is built using modern web technologies.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4321)
npm run dev

# Build for production (includes TypeScript checking)
npm run build

# Preview production build locally
npm run preview

# Start development server on specific host
npm run dev -- --host
```

## Architecture & Key Directories

### Content Management
- **`src/content/blog/`**: Blog posts in Markdown/MDX format with frontmatter metadata
- **`src/content/projects/`**: Project descriptions with metadata (title, description, link, github, updatedDate)
- **`src/content/authors/`**: Author data in JSON format
- **`public/blog/`**: Blog post images and assets

### Core Components Structure
- **`src/components/`**: Reusable Astro components
  - `BaseHead.astro`: SEO meta tags, schema.org markup
  - `Header.astro` & `Footer.astro`: Site navigation and footer
  - `BlogPostMeta.astro`: Post metadata display
  - `ui/`: UI-specific components like pagination

### Page Routing
- **`src/pages/`**: File-based routing
  - `index.astro`: Homepage
  - `about.astro`: About page
  - `blog/index.astro`: Blog listing (page 1)
  - `blog/page/[page].astro`: Blog listing pages 2+ (hand-rolled pagination)
  - `blog/[...slug].astro`: Individual blog posts
  - `projects/index.astro`: Projects listing
  - `projects/[...slug].astro`: Individual project pages
  - `404.astro`: Not-found page
  - `rss.xml.js`: RSS feed generation

### Styling
- **`src/styles/main.css`**: Global styles, Tailwind v4 `@theme` tokens, and the `.prose` overrides
- Uses Atkinson Hyperlegible font for improved readability

## Content Collections Schema

Blog posts require:
```typescript
{
  title: string
  description: string
  pubDate: Date
  updatedDate?: Date
  heroImage?: string           // public-root path, e.g. '/blog/foo.png'
  author: reference<'authors'>  // defaults to 'tavobarrientos'
  relatedPosts?: reference<'blog'>[]
  hidden?: boolean
  showAuthor?: boolean          // defaults to true
}
```

Projects require:
```typescript
{
  title: string
  description: string
  heroImage?: string
  images?: string[]
  links?: { github?: string; website?: string; demo?: string }
  tags?: string[]
  hidden?: boolean
}
```

## Deployment

The site automatically deploys to GitHub Pages via GitHub Actions when pushing to the master branch. The workflow:
1. Builds the site using Astro's official GitHub Action
2. Deploys to GitHub Pages
3. No manual deployment needed

## Key Technical Details

- **Astro Configuration**: MDX support, sitemap generation, GitHub Dark syntax highlighting theme, Tailwind CSS integration
- **Styling**: Tailwind CSS v4 with custom theme configuration, Typography plugin for blog content
- **TypeScript**: Strict mode enabled via Astro's preset
- **Image Optimization**: Uses Astro's Image component for automatic optimization
- **SEO**: Automatic sitemap, RSS feed, and schema.org structured data
- **Custom Design System**: dark-only, defined entirely in `src/styles/main.css`
  - Tailwind v4 is CSS-first: tokens live in `@theme` / `@theme inline`, not a JS config
  - Brand ramp `--color-brand-*`, `--color-fuchsia-*`, plus semantic tokens (`--color-base`, `--color-ink`, `--color-accent`, ...)
  - Typography plugin is loaded via `@plugin "@tailwindcss/typography"` in CSS
  - The `.prose` overrides are deliberately UNLAYERED so they win over the plugin's layered light-theme rules; do not wrap them in `@layer`
- **No testing framework or linter**: Currently no automated tests or linting setup