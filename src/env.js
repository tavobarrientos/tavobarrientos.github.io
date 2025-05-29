// This file is used to define environment variables that can be used in your Astro project
// It's particularly useful for SEO configurations that might change between environments

export default {
  SITE_URL: process.env.SITE_URL || "https://tavobarrientos.github.io",
  SITE_TITLE: process.env.SITE_TITLE || "Gustavo Barrientos",
  SITE_DESCRIPTION: process.env.SITE_DESCRIPTION || "Personal website of Gustavo Barrientos - Developer, writer, and tech enthusiast sharing knowledge about AI, Azure, and software development.",
  TWITTER_HANDLE: process.env.TWITTER_HANDLE || "@tavobarrientos",
  ANALYTICS_ID: process.env.ANALYTICS_ID || "", // Add your Google Analytics ID if you have one
};
