import { z } from "zod";
import { zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/matting/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/matting/matting
 */
export const zImageRemoveBackgroundBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["RemoveBG", "Object"])
        .describe(
            "RemoveBG (the default here): background removal that keeps " +
                "hair and soft edges. Object: subject matting (Topaz's route " +
                "default).",
        )
        .optional(),
    output_format: z
        .literal("png")
        .describe("Output format; this tool only produces PNG.")
        .optional(),
}).strict();
