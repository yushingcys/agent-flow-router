import { z } from "zod";
import { zOutputFormat, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/sharpen/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/sharpen/sharpen
 */
export const zImageSharpenBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum([
            "Standard",
            "Strong",
            "Lens Blur",
            "Lens Blur V2",
            "Motion Blur",
            "Natural",
            "Refocus",
            "Wildlife",
            "Portrait",
            "Auto Sharpen",
        ])
        .describe(
            "Sharpening model, by blur type. Standard (Topaz's default): " +
                "general purpose. Strong: severe blur. Lens Blur / Lens Blur " +
                "V2: defocus. Motion Blur: camera or subject motion. Natural: " +
                "texture-preserving. Refocus: micro-detail. Wildlife: fur and " +
                "feathers. Portrait: people. Auto Sharpen: noise-aware, one " +
                "click.",
        )
        .optional(),
    output_format: zOutputFormat.optional(),
}).strict();
