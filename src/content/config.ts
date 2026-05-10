import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    category:    z.string(),
    description: z.string(),
    stack:       z.array(z.string()),
    metrics:     z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    ),
    repo:        z.string().optional(),
    demo:        z.string().optional(),
    featured:    z.boolean().default(false),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.date(),
    category:    z.string(),
    tags:        z.array(z.string()),
    readingTime: z.number(),
  }),
});

export const collections = { projects, blog };