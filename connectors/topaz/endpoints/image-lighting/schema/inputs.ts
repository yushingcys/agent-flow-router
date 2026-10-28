import { z } from "zod";
import { zOutputFormat, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/lighting/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/lighting/lighting
 */
export const zImageLightingBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum([
            "Adjust",
            "Adjust V2",
            "White Balance",
            "Colorize",
            "Relight Creative V1",
        ])
        .describe(
            "Adjust (Topaz's default) / Adjust V2: exposure and contrast. " +
                "White Balance: color cast correction. Colorize: color for " +
                "black-and-white photos. Relight Creative V1: generative " +
                "relighting (billed 1 credit per 4 MP, not 24).",
        )
        .optional(),
    output_format: zOutputFormat.optional(),
}).strict();
