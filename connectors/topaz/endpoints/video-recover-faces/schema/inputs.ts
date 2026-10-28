import { z } from "zod";
import { videoBody, zEnhanceKnobs } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/proteus/iris
 */
export const zVideoRecoverFacesBody = videoBody(
    z.object({
        model: z
            .enum(["iris-3", "iris-2"])
            .describe(
                "Iris face recovery: iris-3 (current) or iris-2 (previous).",
            ),
        ...zEnhanceKnobs,
    }).strict(),
);
