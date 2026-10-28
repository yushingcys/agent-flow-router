import { z } from "zod";
import { videoBody } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/video-utilities/video-colorization
 */
export const zVideoColorizeBody = videoBody(
    z.object({
        model: z
            .literal("color-1")
            .describe("The video colorization model."),
    }).strict(),
);
