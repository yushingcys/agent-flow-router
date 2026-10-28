import { z } from "zod";
import { videoBody } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/video-utilities/themis-2-motion-deblur
 */
export const zVideoDeblurBody = videoBody(
    z.object({
        model: z
            .literal("thm-2")
            .describe("Themis 2 motion deblur."),
    }).strict(),
);
