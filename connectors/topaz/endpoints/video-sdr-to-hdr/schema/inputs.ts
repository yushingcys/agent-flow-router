import { z } from "zod";
import { videoBody } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/video-utilities
 */
export const zVideoSdrToHdrBody = videoBody(
    z.object({
        model: z
            .enum(["hyp-2.5", "hyp-2", "hyp-1"])
            .describe(
                "Hyperion: hyp-2.5 the highest quality, hyp-2 the previous " +
                    "version, hyp-1 the original (the only one that takes the " +
                    "tuning knobs below).",
            ),
        transferFunction: z
            .enum(["pq", "hlg"])
            .describe("HDR transfer function (hyp-1).")
            .optional(),
        adjustExposure: z.number().min(0).max(1)
            .describe("Exposure adjustment (hyp-1).").optional(),
        boostSaturation: z.number().min(0).max(1)
            .describe("Saturation boost (hyp-1).").optional(),
        highlightThreshold: z.number().min(0.45).max(0.85)
            .describe("Level above which pixels count as highlights (hyp-1).")
            .optional(),
    }).strict(),
);
