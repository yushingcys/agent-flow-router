import { z } from "zod";
import { videoBody, zEnhanceKnobs } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/proteus/gaia
 */
export const zVideoUpscaleAnimationBody = videoBody(
    z.object({
        model: z
            .enum(["ganim-1", "ghq-5", "gcg-5"])
            .describe(
                "ganim-1: Gaia 2, frame-by-frame 2x upscaling for animation " +
                    "(cheaper). ghq-5: Gaia High Quality. gcg-5: Gaia CG, for " +
                    "computer graphics.",
            ),
        ...zEnhanceKnobs,
    }).strict(),
);
