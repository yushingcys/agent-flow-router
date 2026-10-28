import { z } from "zod";
import { zOutputFormat, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/denoise-gen/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/image-models/denoise/max
 */
export const zImageDenoiseGenerativeBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["Denoise Max"])
        .describe(
            "Denoise Max, the generative denoiser (the only model on this " +
                "route).",
        )
        .optional(),
    output_format: zOutputFormat.optional(),
    strength: z.number().min(0.01).max(1)
        .describe("Noise reduction; too high softens detail. Auto if unset.")
        .optional(),
    minorDeblur: z.number().min(0.01).max(1)
        .describe("Slight sharpening against denoise softness. Auto if unset.")
        .optional(),
    originalDetail: z.number().min(0).max(1)
        .describe("Return fine texture lost to denoising. Auto if unset.")
        .optional(),
    faceEnhancement: z
        .boolean()
        .describe(
            "Also recover faces; then set faceEnhancementStrength and " +
                "faceEnhancementCreativity.",
        )
        .optional(),
    faceEnhancementStrength: z.number().min(0).max(1)
        .describe("Strength of the face recovery.").optional(),
    faceEnhancementCreativity: z.number().min(0).max(1)
        .describe("Realistic (0) to creative (1) face recovery.").optional(),
    subjectDetection: z
        .enum(["foreground", "background", "all"])
        .describe("Where the enhancement is applied.")
        .optional(),
}).strict();
