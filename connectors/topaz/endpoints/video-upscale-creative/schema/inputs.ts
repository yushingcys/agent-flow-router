import { z } from "zod";
import { videoBody } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/astra/astra-2
 */
export const zVideoUpscaleCreativeBody = videoBody(
    z.object({
        model: z
            .literal("ast-2")
            .describe("Astra 2."),
        prompt: z
            .string()
            .describe("Optional text guiding the new detail and style.")
            .optional(),
        creativity: z.number().min(0).max(1)
            .describe("How much new detail is invented (Topaz defaults to 0).")
            .optional(),
        sharp: z.number().min(0).max(1)
            .describe(
                "Pre-enhance sharpness: 0 blurs, 0.5 (Topaz's default) " +
                    "passes through, 1 sharpens.",
            )
            .optional(),
    }).strict(),
);
