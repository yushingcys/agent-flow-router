import { defineEndpoint } from "@shared/core";
import { z } from "zod";
import {
    estimateImage,
    evidenceImage,
    startEdit,
    tokenModel,
    zEditFields,
    zQuality2,
} from "../../schema/images.ts";

export default defineEndpoint({
    endpoint: "/v1/image/gpt-image-2-edit",
    meta: {
        displayName: "Edit Image (GPT Image 2)",
        summary: "Edit or compose up to 16 reference images with GPT Image 2.",
        description:
            "Edit an image, or compose a new one from up to 16 reference " +
            "images, with a natural-language instruction and an optional " +
            "inpainting mask, using GPT Image 2: the April 2026 model " +
            "with low, medium and high quality; pin it to keep that " +
            "snapshot (GPT Image 2.5 reaches the same quality labels for " +
            "fewer output tokens). Images go in as public https:// URLs " +
            "or base64 files. Returns the result base64-encoded in " +
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
                    .enum(["gpt-image-2", "gpt-image-2-2026-04-21"])
                    .describe(
                        "gpt-image-2 (default) or its dated snapshot gpt-image-2-2026-04-21.",
                    )
                    .default("gpt-image-2"),
                quality: zQuality2.optional(),
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
