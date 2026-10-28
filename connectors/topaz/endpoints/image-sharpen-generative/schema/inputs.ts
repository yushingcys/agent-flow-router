import { z } from "zod";
import { zOutputFormat, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/sharpen-gen/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/sharpen/sharpen-generative
 */
export const zImageSharpenGenerativeBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["Super Focus V2", "Super Focus V3"])
        .describe(
            "Super Focus V2 (Topaz's default) or V3, which adds selective " +
                "refinement.",
        )
        .optional(),
    output_format: zOutputFormat.optional(),
}).strict();
