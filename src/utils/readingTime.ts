export function getReadingTime(content: string): string {
  if (!content) return '< 1 min read';
  
  const clean = content.replace(/<\/?[^>]+(>|$)/g, '');
  const numberOfWords = clean.split(/\s/g).length;
  const wordsPerMinute = 200;
  
  const readingTimeInMinutes = Math.max(1, Math.floor(numberOfWords / wordsPerMinute));
  return `${readingTimeInMinutes} min read`;
}
