// The search index for the blog's search box: one entry per visible post with
// its title, summary, topic, date and plain body text. Fetched the first time
// the box is used, so it costs nothing on a normal page view.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { linesOf } from '../../data/lines';
import { getReadingTime } from '../../utils/readingTime';

const plain = (md: string) =>
	md
		.replace(/^\s*(import|export)\s.+$/gm, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<\/?[^>]+(>|$)/g, ' ')
		.replace(/https?:\/\/\S+/g, ' ')
		.replace(/[`*_#>|~]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog'))
		.filter((p) => !p.data.hidden)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const index = posts.map((p) => {
		const lines = linesOf(p.data.line);
		return {
			url: `/blog/${p.id}/`,
			title: p.data.title,
			description: p.data.description?.trim() === p.data.title.trim() ? '' : (p.data.description ?? ''),
			topic: lines.map((l) => l.name).join(' '),
			topicId: lines[0].id,
			topics: lines.map(({ id, name }) => ({ id, name })),
			date: p.data.pubDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
			readingTime: getReadingTime(p.body ?? ''),
			body: plain(p.body ?? ''),
		};
	});

	return new Response(JSON.stringify(index), {
		headers: { 'Content-Type': 'application/json' },
	});
};
