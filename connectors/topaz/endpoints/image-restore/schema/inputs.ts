import { z } from "zod";
import { zOutputFormat, zSourceUrl } from "../../../schema/image.ts";

/**
 * `POST /image/v1/restore-gen/async` form, read 2026-10-27 from
 * https://developer.topazlabs.com/reference/image/restore/restore-generative
 */
export const zImageRestoreBody = z.object({
    source_url: zSourceUrl,
    model: z
        .enum(["Dust-Scratch", "Dust-Scratch V2", "Face Recovery V3"])
        .describe(
            "Dust-Scratch (Topaz's default) / Dust-Scratch V2: remove " +
                "dust, scratches and blemishes from scanned prints. Face " +
                "Recovery V3: restore faces in low-resolution or old " +
                "portraits.",
        )
        .optional(),
    output_format: zOutputFormat.optional(),
    strength: z.number().min(0).max(1)
        .describe("Face Recovery V3 strength (Topaz defaults to 1).")
        .optional(),
}).strict();
