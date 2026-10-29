import { defineEndpoint } from "@shared/core";
import { z } from "zod";
import {
    estimateImage,
    evidenceImage,
    tokenModel,
    zImageFields,
    zQuality25,
} from "../../schema/images.ts";

export default defineEndpoint({
    endpoint: "/v1/image/gpt-image-2.5-flare",
    meta: {
        displayName: "Generate Image (GPT Image 2.5 Flare)",
        summary: "Text-to-image with GPT Image 2.5 Flare.",
        description:
            "Generate images from a text prompt with GPT Image 2.5 Flare: " +
            "the fastest GPT Image model for everyday generation; the " +
            "same five quality tiers and rates as Sunburst with less " +
            "editing precision. Any WIDTHxHEIGHT size in multiples of 16 " +
            "up to 3840x2160, transparent backgrounds, and legible text " +
            "including non-Latin scripts. Returns the images " +
            "base64-encoded in `data[].b64_json` with the echoed size, " +
            "quality, background and token usage.",
        docsUrl:
            "https://developers.openai.com/api/docs/guides/image-generation",
    },
    request: { method: "POST", path: "/v1/images/generations" },
    input: {
        schema: {
            body: z.object({
                ...zImageFields,
                model: z
                    .enum([
                        "gpt-image-2.5-flare",
                        "gpt-image-2.5-flare-2026-09-08",
                    ])
                    .describe(
                        "gpt-image-2.5-flare (default) or its dated snapshot gpt-image-2.5-flare-2026-09-08.",
                    )
                    .default("gpt-image-2.5-flare"),
                quality: zQuality25.optional(),
            }).strict(),
        },
    },
    usage: {
        model: tokenModel,
        estimate: estimateImage,
        evidence: evidenceImage,
    },
});
