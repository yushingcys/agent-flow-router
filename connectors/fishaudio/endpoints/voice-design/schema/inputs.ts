import { z } from "zod";

/** POST /v1/voice-design body (additionalProperties: false upstream). */
export const zVoiceDesignBody = z.strictObject({
    instruction: z.string().min(1).max(2000).describe(
        "Describe the voice, e.g. 'warm, confident studio narrator with a " +
            "natural tone'.",
    ),
    reference_text: z.string().max(150).describe(
        "What the candidates say in their previews (max 150 characters).",
    ).nullable().optional(),
    language: z.string().describe("BCP-47 language hint, e.g. 'en'.")
        .nullable().optional(),
    n: z.number().int().min(1).max(4).describe(
        "Candidates to generate, 1-4 (default 2). Same price for any n.",
    ).optional(),
    speed: z.number().gt(0).max(3).describe(
        "Speaking speed of the previews (default 1).",
    ).optional(),
    num_step: z.number().int().min(1).max(128).describe(
        "Diffusion steps (default 32).",
    ).optional(),
    guidance_scale: z.number().min(0).describe(
        "How strongly to follow the instruction (default 2).",
    ).optional(),
    instruct_guidance_scale: z.number().min(0).describe(
        "Instruction guidance scale (default 0).",
    ).optional(),
    seed: z.number().int().describe("Deterministic seed.").nullable()
        .optional(),
});
