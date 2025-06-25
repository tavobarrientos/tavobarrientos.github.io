import { defineCollection, reference, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		author: reference('authors').default("tavobarrientos"),
		relatedPosts: z.array(reference('blog')).optional(),
		hidden: z.boolean().optional(),
		showAuthor: z.boolean().optional().default(true),
	}),
});

const projects = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		heroImage: z.string().optional(),
		images: z.array(z.string()).optional(),
		links: z.object({
			github: z.string().url().optional(),
			website: z.string().url().optional(),
			demo: z.string().url().optional(),
		}).optional(),
		tags: z.array(z.string()).optional(),
		hidden: z.boolean().optional(),
	}),
});

const authors = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		email: z.string().email(),
		bio: z.string().optional(),
		github: z.string().url().optional(),
		twitter: z.string().url().optional(),
	}),
});

export const collections = { blog, projects, authors };
