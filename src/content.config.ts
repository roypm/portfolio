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
      pinned: z.boolean().default(false),
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

const education = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/education" }),
  schema: z.object({
    kind: z.enum(["degree", "course"]),
    hidden: z.boolean().default(false),
    title: z.string(),
    place: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    certificate: z
      .string()
      .refine(
        (value) =>
          (value.startsWith("/certificates/") &&
            /\.(pdf|png|jpe?g|webp)$/i.test(value)) ||
          value.startsWith("https://"),
        "Use a PDF or image in public/certificates or an https URL",
      )
      .optional(),
    url: z
      .string()
      .url()
      .refine((value) => value.startsWith("https://"), "Use an https URL")
      .optional(),
  }),
});

export const collections = { home, projects, experience, education };
