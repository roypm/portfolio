import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const home = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/home" }),
  schema: ({ image }) =>
    z.object({
      name: z.string().default(""),
      role: z.string().default(""),
      sentence: z.string().default(""),
      photo: image().optional(),
      focus: z.string().default(""),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      image: image().optional(),
      stack: z.array(z.string()).default([]),
      url: z.string().url().optional(),
      order: z.number(),
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/experience" }),
  schema: z.object({
    role: z.string(),
    place: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
  }),
});

export const collections = { home, projects, experience };
