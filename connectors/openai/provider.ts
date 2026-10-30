import { defineProvider, presets } from "@shared/core";

/**
 * OpenAI Images API (developers.openai.com/api/docs/guides/image-generation)
 * - the GPT Image models behind `POST /v1/images/generations` (JSON) and
 * `POST /v1/images/edits` (multipart). One Bearer-auth API at
 * `https://api.openai.com`.
 *
 * Each endpoint pins one model family under Monid's path
 * (`openai#v1/image/<model>[-edit]`): gpt-image-2 (April 2026, quality
 * low/medium/high) and the GPT Image 2.5 pair gpt-image-2.5-sunburst
 * (editing precision) and gpt-image-2.5-flare (speed), which add the
 * `xhigh` and `max` tiers. `model` is a body field limited to the
 * family's alias and its dated snapshot.
 *
 * BILLING in US dollars at OpenAI's per-token card, the same for all
 * three models (OpenAI model pages, read 2026-10-29; Monid lists the
 * same): text input $5 / 1M tokens, image input $8 / 1M, image output
 * $30 / 1M. Every response reports `usage` with the input split into
 * text and image tokens, so the run settles on those counts. Cached
 * input discounts are not reported per response and are not modeled.
 */
export default defineProvider({
    name: "openai",
    meta: {
        displayName: "OpenAI",
        summary:
            "GPT Image text-to-image generation and reference-guided image editing.",
        description: "OpenAI's GPT Image models: generate images from a " +
            "text prompt or edit and compose up to 16 reference images " +
            "with an optional inpainting mask. gpt-image-2 and the GPT " +
            "Image 2.5 pair (Sunburst for editing precision, Flare for " +
            "speed) render legible text including non-Latin scripts, take " +
            "any WIDTHxHEIGHT size in multiples of 16 up to 3840x2160, and " +
            "support transparent backgrounds. Images come back " +
            "base64-encoded (`data[].b64_json`) with the token usage.",
        homepageUrl: "https://openai.com",
        docsUrl:
            "https://developers.openai.com/api/docs/guides/image-generation",
        categories: ["image-generation"],
        notes: [
            "Images return base64-encoded in `data[].b64_json`; there is no " +
            "hosted URL to download.",
            "Generation takes from a few seconds up to about 2 minutes at " +
            "the highest quality and size.",
            "Every prompt and image passes OpenAI's content moderation; a " +
            "rejected request fails unbilled.",
            "Billed per token at $5 / 1M text input, $8 / 1M image input " +
            "and $30 / 1M image output tokens, settled on the usage OpenAI " +
            "reports. The pre-run hold estimates output tokens from " +
            "quality, size and n.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.openai.com" },
    timeouts: { requestMs: 300_000, runMs: 320_000 },
    usage: {
        credits: { default: { label: "US dollars" } },
    },
    output: {
        /** OpenAI errors are `{error: {message, type, param, code}}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.error.message",
            );
            const code = utils.json.optionalGet(data.output, "$.error.code");
            const type = utils.json.optionalGet(data.output, "$.error.type");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "OpenAI API error",
                ...(typeof code === "string"
                    ? { code }
                    : typeof type === "string"
                    ? { code: type }
                    : {}),
                raw: data.output,
            };
        },
    },
});
