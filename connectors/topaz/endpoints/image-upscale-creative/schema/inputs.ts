import { z } from "zod";
import {
    zCropToFill,
    zOutputFormat,
    zOutputSide,
    zSourceUrl,
} from "../../../schema/image.ts";

/**
 * `POST /image/v1/enhance-gen/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/enhance/enhance-generative
 */
export const zImageUpscaleCreativeBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["Bloom 2", "Bloom", "Bloom Realism"])
        .describe(
            "Bloom creative model. Bloom 2 (the default here): the " +
                "newest, prompt-guided. Bloom: creative detail for AI art and " +
                "illustration. Bloom Realism: realistic detail for " +
                "AI-generated photos.",
        )
        .optional(),
    output_width: zOutputSide("width").optional(),
    output_height: zOutputSide("height").optional(),
    crop_to_fill: zCropToFill.optional(),
    output_format: zOutputFormat.optional(),
    prompt: z
        .string()
        .describe("Optional text guiding the new detail (Bloom 2).")
        .optional(),
    creativity: z
        .number()
        .int()
        .min(1)
        .max(9)
        .describe(
            "How much new detail is invented: Bloom 2 takes 1-9 (default " +
                "3), Bloom Realism 1-4 (default 2).",
        )
        .optional(),
    seed: z
        .number()
        .int()
        .min(1)
        .describe("Random seed, for repeatable output.")
        .optional(),
    colorPreservation: z
        .boolean()
        .describe("Keep the source colors (Topaz defaults to true).")
        .optional(),
    facePreservation: z
        .boolean()
        .describe("Keep faces close to the source (Bloom; default true).")
        .optional(),
    creativityBoost: z
        .boolean()
        .describe("Push creativity further (Bloom; default false).")
        .optional(),
}).strict();
