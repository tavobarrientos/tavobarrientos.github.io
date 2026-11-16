const WORDS_PER_MINUTE = 200;
const SECONDS_PER_IMAGE = 12;

/** Words a reader actually reads in a Markdown/MDX body, and its image count. */
export function countReadable(content: string): { words: number; images: number } {
  if (!content) return { words: 0, images: 0 };

  // Fenced code is read too (these are tutorials), but its fence lines are not
  let text = content.replace(/^[ \t]*(```|~~~).*$/gm, '');

  const images = (text.match(/!\[[^\]]*\]\([^)]*\)|<img\b/gi) ?? []).length;

  text = text
    .replace(/^\s*(import|export)\s.+$/gm, '') // MDX module lines
    .replace(/<!--[\s\S]*?-->/g, '') // HTML comments
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links: keep the label, drop the URL
    .replace(/<\/?[^>]+(>|$)/g, ' ') // HTML/JSX tags
    .replace(/https?:\/\/\S+/g, ' '); // bare URLs

  // A word has at least one letter or digit, so `#`, `---`, `|`, `{` do not count
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return { words, images };
}

export function getReadingTime(content: string): string {
  const { words, images } = countReadable(content);
  if (!words && !images) return '< 1 min read';

  const minutes = words / WORDS_PER_MINUTE + (images * SECONDS_PER_IMAGE) / 60;
  return `${Math.max(1, Math.ceil(minutes))} min read`;
}
