import { z } from "zod";

/** GET /v2/voices query. */
export const zVoicesQuery = z.looseObject({
    search: z.string().describe(
        "Filter by name, description, labels or category.",
    ).optional(),
    page_size: z.number().int().min(1).max(100).describe(
        "Voices per page (vendor default 10, max 100).",
    ).optional(),
    next_page_token: z.string().describe(
        "The `next_page_token` from the previous page.",
    ).optional(),
    sort: z.enum(["created_at_unix", "name"]).describe("Sort field.")
        .optional(),
    sort_direction: z.enum(["asc", "desc"]).describe("Sort direction.")
        .optional(),
    voice_type: z.enum([
        "personal",
        "community",
        "default",
        "workspace",
        "non-default",
        "saved",
    ]).describe(
        "'default' is ElevenLabs' premade voices; 'non-default' everything " +
            "else.",
    ).optional(),
    category: z.enum(["premade", "cloned", "generated", "professional"])
        .describe("Voice category.").optional(),
    gender: z.string().describe("Filter on the voice's gender label.")
        .optional(),
    age: z.string().describe("Filter on the voice's age label.").optional(),
    accent: z.string().describe("Filter on the voice's accent label.")
        .optional(),
    language: z.array(z.string()).describe(
        "Voices matching any of these language labels.",
    ).optional(),
    use_cases: z.array(z.string()).describe(
        "Voices matching any of these use-case labels.",
    ).optional(),
    voice_ids: z.array(z.string()).max(100).describe(
        "Look up these voice IDs (max 100).",
    ).optional(),
    include_total_count: z.boolean().describe(
        "Include `total_count` (slower; keep off when paging).",
    ).optional(),
});
