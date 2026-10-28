import { z } from "zod";

const zSection = z.looseObject({
    section_name: z.string().describe("e.g. 'Verse 1', 'Chorus'."),
    positive_local_styles: z.array(z.string()).describe(
        "Styles this section should have.",
    ),
    negative_local_styles: z.array(z.string()).describe(
        "Styles this section should avoid.",
    ),
    duration_ms: z.number().int().min(3000).max(120000).describe(
        "Section length in milliseconds (3,000-120,000).",
    ),
    lines: z.array(z.string()).describe("Lyrics lines for this section."),
});

/** POST /v1/music body. */
export const zMusicBody = z.looseObject({
    prompt: z.string().max(4100).describe(
        "What to compose, e.g. 'upbeat synthwave with female vocals about " +
            "night driving'. Not combined with `composition_plan`.",
    ).nullable().optional(),
    composition_plan: z.looseObject({
        positive_global_styles: z.array(z.string()).describe(
            "Styles for the whole song.",
        ),
        negative_global_styles: z.array(z.string()).describe(
            "Styles the whole song avoids.",
        ),
        sections: z.array(zSection).describe("The song, section by section."),
    }).describe(
        "A section-by-section plan instead of `prompt`; the sections' " +
            "durations set the length.",
    ).nullable().optional(),
    lyrics_text: z.string().describe("Lyrics to sing.").nullable().optional(),
    music_length_ms: z.number().int().min(3000).max(600000).describe(
        "Song length in ms (3,000-600,000), with `prompt` only. Omitted, " +
            "the model picks a length.",
    ).nullable().optional(),
    model_id: z.string().describe("Music model (vendor default 'music_v1').")
        .optional(),
    seed: z.number().int().describe(
        "Seed for more consistent results across runs.",
    ).nullable().optional(),
    force_instrumental: z.boolean().describe(
        "Guarantee an instrumental track (with `prompt`).",
    ).optional(),
    respect_sections_durations: z.boolean().describe(
        "Hold each plan section to its exact duration (default true).",
    ).optional(),
});
