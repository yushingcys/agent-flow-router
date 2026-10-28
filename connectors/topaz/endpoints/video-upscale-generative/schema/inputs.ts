import { z } from "zod";
import { videoBody } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/starlight
 */
export const zVideoUpscaleGenerativeBody = videoBody(
    z.object({
        model: z
            .enum(["slp-2.6", "slf-3", "slf-2", "slhq-1", "slm-1"])
            .describe(
                "Starlight model. slp-2.6: Precise 2.6, realistic faces, " +
                    "textures and text. slf-3: Fast 3. slf-2: Fast 2, the " +
                    "cheapest. slhq-1: HQ, maximum quality for high-resolution " +
                    "sources. slm-1: Mini, for archival and interlaced footage.",
            ),
        sharpness: z.number().min(1).max(5)
            .describe(
                "Precise 2.6 sharpening, 1 (soft) to 5 (Topaz's default).",
            )
            .optional(),
    }).strict(),
);
