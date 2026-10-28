import { z } from "zod";
import { zCropToFill, zOutputSide, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/tool/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/tool/tool
 */
export const zImageUpscaleTransparentBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["Transparency Upscale"])
        .describe(
            "The transparency-preserving upscaler (the only model on this " +
                "route).",
        )
        .optional(),
    output_width: zOutputSide("width").optional(),
    output_height: zOutputSide("height").optional(),
    crop_to_fill: zCropToFill.optional(),
    output_format: z
        .literal("png")
        .describe("Output format; this tool only produces PNG.")
        .optional(),
}).strict();
