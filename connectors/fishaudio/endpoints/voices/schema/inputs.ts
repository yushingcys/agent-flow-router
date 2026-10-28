import { z } from "zod";

const zStrings = z.union([z.string(), z.array(z.string())]);

/** GET /model query. */
export const zVoicesQuery = z.looseObject({
    page_size: z.number().int().min(1).max(100).describe(
        "Voices per page (default 10, max 100).",
    ).optional(),
    page_number: z.number().int().min(1).describe("Page, from 1.")
        .optional(),
    title: z.string().describe("Filter by title.").optional(),
    tag: zStrings.describe("Filter by tag(s).").optional(),
    self: z.boolean().describe(
        "Only voices this account owns (its clones and designs).",
    ).optional(),
    author_id: z.string().describe(
        "Filter public voices by author (ignored with self).",
    ).optional(),
    language: zStrings.describe("Filter by language(s), e.g. 'en'.")
        .optional(),
    title_language: zStrings.describe("Filter by title language(s).")
        .optional(),
    licensed: z.boolean().describe(
        "Only voices Fish Audio licensed from their owners.",
    ).optional(),
    sort_by: z.enum(["score", "task_count", "created_at"]).describe(
        "Sort order (default 'score').",
    ).optional(),
});
