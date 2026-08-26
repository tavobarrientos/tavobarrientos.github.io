import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Strip only the extension so ids stay byte-identical to the pre-v6 slugs.
// The default generator kebab-cases via github-slugger, which would rewrite
// `microsoft_agent_framework` and change a live URL plus a relatedPosts ref.
const idFromFilename = ({ entry }: { entry: string }) =>
	entry.replace(/\.(md|mdx)$/, '');

const blog = defineCollection({
	loader: glob({
		pattern: '**/*.{md,mdx}',
		base: './src/content/blog',
		generateId: idFromFilename,
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		// Zod 4: .default() is output-typed and would short-circuit reference()'s
		// transform, yielding the bare string instead of { collection, id }.
		// .prefault() applies on the input side, so the transform still runs.
		author: reference('authors').prefault('tavobarrientos'),
		relatedPosts: z.array(reference('blog')).optional(),
		hidden: z.boolean().optional(),
		showAuthor: z.boolean().optional().default(true),
	}),
});

const projects = defineCollection({
	loader: glob({
		pattern: '**/*.{md,mdx}',
		base: './src/content/projects',
		generateId: idFromFilename,
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		heroImage: z.string().optional(),
		images: z.array(z.string()).optional(),
		links: z.object({
			github: z.url().optional(),
			website: z.url().optional(),
			demo: z.url().optional(),
		}).optional(),
		tags: z.array(z.string()).optional(),
		hidden: z.boolean().optional(),
	}),
});

// glob, not file(): file() derives ids from keys inside a single JSON document.
// There is one JSON per author, so glob yields id 'tavobarrientos', which is
// what reference('authors') and Author.astro's getEntry() expect.
const authors = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
	schema: z.object({
		name: z.string(),
		email: z.email(),
		bio: z.string().optional(),
		github: z.url().optional(),
		twitter: z.url().optional(),
	}),
});

export const collections = { blog, projects, authors };
