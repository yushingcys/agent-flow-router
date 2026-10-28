import { z } from "zod";
import {
    zCropToFill,
    zOutputFormat,
    zOutputSide,
    zSourceUrl,
} from "../../../schema/image.ts";

/**
 * `POST /image/v1/enhance/async` form (reference/image/enhance/enhance,
 * read 2026-10-27), the Gigapixel precision models. "Upscale High Fidelity
 * V3" is documented on its model page ahead of the OpenAPI enum.
 */
export const zImageUpscaleBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum([
            "Standard V2",
            "Low Resolution V2",
            "CGI",
            "High Fidelity V2",
            "Upscale High Fidelity V3",
            "Text Refine",
        ])
        .describe(
            "Gigapixel model. Standard V2: general purpose (Topaz's " +
                "default). Low Resolution V2: small or heavily compressed " +
                "sources. CGI: art, illustration and graphics. High " +
                "Fidelity V2/V3: high-resolution professional photos. Text " +
                "Refine: text and shapes.",
        )
        .optional(),
    output_width: zOutputSide("width").optional(),
    output_height: zOutputSide("height").optional(),
    crop_to_fill: zCropToFill.optional(),
    output_format: zOutputFormat.optional(),
}).strict();
