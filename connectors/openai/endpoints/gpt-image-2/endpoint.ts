import { defineEndpoint } from "@shared/core";
import { z } from "zod";
import {
    estimateImage,
    evidenceImage,
    tokenModel,
    zImageFields,
    zQuality2,
} from "../../schema/images.ts";

export default defineEndpoint({
    endpoint: "/v1/image/gpt-image-2",
    meta: {
        displayName: "Generate Image (GPT Image 2)",
        summary: "Text-to-image with GPT Image 2.",
        description:
            "Generate images from a text prompt with GPT Image 2: the " +
            "April 2026 model with low, medium and high quality; pin it " +
            "to keep that snapshot (GPT Image 2.5 reaches the same " +
            "quality labels for fewer output tokens). Any WIDTHxHEIGHT " +
            "size in multiples of 16 up to 3840x2160, transparent " +
            "backgrounds, and legible text including non-Latin scripts. " +
            "Returns the images base64-encoded in `data[].b64_json` with " +
            "the echoed size, quality, background and token usage.",
        docsUrl:
            "https://developers.openai.com/api/docs/guides/image-generation",
    },
    request: { method: "POST", path: "/v1/images/generations" },
    input: {
        schema: {
            body: z.object({
                ...zImageFields,
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
    usage: {
        model: tokenModel,
        estimate: estimateImage,
        evidence: evidenceImage,
    },
});
