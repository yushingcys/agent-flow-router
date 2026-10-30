import { defineEndpoint } from "@shared/core";
import { z } from "zod";
import {
    estimateImage,
    evidenceImage,
    startEdit,
    tokenModel,
    zEditFields,
    zQuality25,
} from "../../schema/images.ts";

export default defineEndpoint({
    endpoint: "/v1/image/gpt-image-2.5-sunburst-edit",
    meta: {
        displayName: "Edit Image (GPT Image 2.5 Sunburst)",
        summary:
            "Edit or compose up to 16 reference images with GPT Image 2.5 Sunburst.",
        description:
            "Edit an image, or compose a new one from up to 16 reference " +
            "images, with a natural-language instruction and an optional " +
            "inpainting mask, using GPT Image 2.5 Sunburst: the most " +
            "capable GPT Image model, built for edits that must preserve " +
            "the source; five quality tiers up to max, slower than Flare " +
            "at the same tier. Images go in as public https:// URLs or " +
            "base64 files. Returns the result base64-encoded in " +
            "`data[].b64_json` with the echoed size, quality, background " +
            "and token usage.",
        docsUrl:
            "https://developers.openai.com/api/docs/guides/image-generation#edit-images",
    },
    request: { method: "POST", path: "/v1/images/edits" },
    input: {
        schema: {
            body: z.object({
                ...zEditFields,
                model: z
                    .enum([
                        "gpt-image-2.5-sunburst",
                        "gpt-image-2.5-sunburst-2026-09-08",
                    ])
                    .describe(
                        "gpt-image-2.5-sunburst (default) or its dated snapshot gpt-image-2.5-sunburst-2026-09-08.",
                    )
                    .default("gpt-image-2.5-sunburst"),
                quality: zQuality25.optional(),
            }).strict(),
        },
    },
    lifecycle: { start: startEdit },
    usage: {
        model: tokenModel,
        estimate: estimateImage,
        evidence: evidenceImage,
    },
});
