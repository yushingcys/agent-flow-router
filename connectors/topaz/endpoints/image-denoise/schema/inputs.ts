import { z } from "zod";
import { zOutputFormat, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/denoise/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/denoise/denoise
 */
export const zImageDenoiseBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["Normal", "Strong", "Extreme"])
        .describe(
            "Noise reduction strength: Normal (Topaz's default) for " +
                "general noise, Strong for heavy noise while keeping detail, " +
                "Extreme for the most removal.",
        )
        .optional(),
    output_format: zOutputFormat.optional(),
}).strict();
