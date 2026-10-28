import { z } from "zod";
import { videoBody } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/frame-interpolation
 */
export const zVideoFrameInterpolationBody = videoBody(
    z.object({
        model: z
            .enum(["apo-8", "apf-2", "chr-2", "chf-3", "aion-1"])
            .describe(
                "apo-8: Apollo, general slow motion. apf-2: Apollo Fast. " +
                    "chr-2: Chronos, natural real-world motion. chf-3: Chronos " +
                    "Fast. aion-1: Aion, extreme slow motion for complex " +
                    "high-resolution motion (about 3x the price).",
            ),
        slowmo: z.number().int().min(1).max(16)
            .describe(
                "Slow-motion factor: 2 doubles the duration. Multiplies " +
                    "the output frames, and the price.",
            )
            .optional(),
        fps: z.number().min(15).max(240)
            .describe(
                "Target frame rate without changing duration; the output " +
                    "uses the greater of this and output.frameRate.",
            )
            .optional(),
        duplicate: z
            .boolean()
            .describe("Detect and drop duplicate source frames.")
            .optional(),
        duplicateThreshold: z.number().min(0.001).max(0.1)
            .describe("Sensitivity of duplicate-frame detection.")
            .optional(),
    }).strict(),
);
