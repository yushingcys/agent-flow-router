import { z } from "zod";
import { videoBody, zEnhanceKnobs } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/proteus/artemis
 */
export const zVideoFixArtifactsBody = videoBody(
    z.object({
        model: z
            .enum([
                "ahq-12",
                "amq-13",
                "alq-13",
                "amqs-2",
                "alqs-2",
                "aaa-9",
                "aaa-10",
            ])
            .describe(
                "Artemis model by source quality: ahq-12 high, amq-13 medium, " +
                    "alq-13 low quality; amqs-2 / alqs-2 medium / strong halo " +
                    "reduction; aaa-9 / aaa-10 aliasing and moire.",
            ),
        ...zEnhanceKnobs,
    }).strict(),
);
