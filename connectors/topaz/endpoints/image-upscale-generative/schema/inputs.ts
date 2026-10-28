import { z } from "zod";
import {
    zCropToFill,
    zOutputFormat,
    zOutputSide,
    zSourceUrl,
} from "../../../schema/image.ts";

/**
 * `POST /image/v1/enhance-gen/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/enhance/enhance-generative
 */
export const zImageUpscaleGenerativeBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum([
            "Wonder 3.5",
            "Wonder 3",
            "Wonder 2",
            "Wonder",
            "Standard MAX",
            "Recover 3",
            "Recovery V2",
        ])
        .describe(
            "Wonder generative model. Wonder 3.5 (the default here): the " +
                "highest-quality generative upscaler, best on degraded or " +
                "compressed photos. Wonder 3 / 2 / Wonder: earlier " +
                "generations. Standard MAX: high-quality precision upscaling. " +
                "Recover 3 / Recovery V2: rich natural detail for low-quality " +
                "sources. Topaz's own route default, Redefine, is a creative " +
                "model and is not offered here.",
        )
        .optional(),
    output_width: zOutputSide("width").optional(),
    output_height: zOutputSide("height").optional(),
    crop_to_fill: zCropToFill.optional(),
    output_format: zOutputFormat.optional(),
    enhancementStrength: z
        .enum(["low", "medium", "high"])
        .describe(
            "Wonder 3.5 enhancement strength. Topaz defaults to high.",
        )
        .optional(),
}).strict();
