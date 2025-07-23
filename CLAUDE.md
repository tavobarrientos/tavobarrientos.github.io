# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and blog website built with Astro, deployed to GitHub Pages at https://tavobarrientos.github.io. The site features technical blog posts, project showcases, and is built using modern web technologies.

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
  - `blog/[...page].astro`: Blog listing with pagination
  - `blog/[slug].astro`: Individual blog posts
  - `projects/[...page].astro`: Projects listing
  - `rss.xml.js`: RSS feed generation

### Styling
- **`src/styles/global.css`**: Global styles and CSS variables
- Uses Atkinson Hyperlegible font for improved readability

## Content Collections Schema

Blog posts require:
```typescript
{
  title: string
  description: string
  publishDate: Date
  updatedDate?: Date
  tags?: string[]
  draft?: boolean
}
```

Projects require:
```typescript
{
  title: string
  description: string
  link?: string
  github?: string
  updatedDate: Date
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
- **Custom Design System**: 
  - Colors: Custom accent (#2337ff), gray palette, Atkinson font family
  - Responsive breakpoints: 720px, 480px, 360px
  - Typography scale with custom heading sizes
- **No testing framework or linter**: Currently no automated tests or linting setup