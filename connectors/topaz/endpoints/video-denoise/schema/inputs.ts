import { z } from "zod";
import { videoBody, zEnhanceKnobs } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/denoise
 */
export const zVideoDenoiseBody = videoBody(
    z.object({
        model: z
            .enum(["nyx-3", "nxf-1", "nxl-1", "nxhf-1"])
            .describe(
                "Nyx denoiser: nyx-3 natural texture preservation, nxf-1 " +
                    "fast, nxl-1 XL for extreme noise, nxhf-1 high fidelity (does " +
                    "not upscale).",
            ),
        ...zEnhanceKnobs,
    }).strict(),
);
