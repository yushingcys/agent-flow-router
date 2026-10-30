import { defineProvider, presets } from "@shared/core";

/**
 * Google Gemini API (ai.google.dev/gemini-api) - Gemini Omni Flash video
 * generation and editing, at `https://generativelanguage.googleapis.com`,
 * auth `x-goog-api-key`.
 *
 * Omni runs on the Interactions API, not Veo's `:predictLongRunning`: each
 * endpoint creates a background interaction (`POST /v1beta/interactions`
 * with `background: true`) and polls `GET /v1beta/interactions/{id}`
 * (`schema/omni.ts`). Each Monid path pins one Omni task mode
 * (`generation_config.video_config.task`).
 *
 * The finished video is delivered by uri by default: it lives in the
 * Gemini Files API, whose download needs the API key, so the result
 * carries the file id and `gemini#v1beta/files/{file}/download` fetches
 * it (the firecrawl pass-through route). `delivery: "inline"` returns the
 * MP4 base64 in the result instead.
 *
 * BILLING in US dollars per token, settled on the interaction's `usage`
 * (see `tokenModel` in schema/omni.ts).
 */
export default defineProvider({
    name: "gemini",
    meta: {
        displayName: "Google Gemini",
        summary:
            "Gemini Omni Flash: text, image and reference to video, plus video editing and extension.",
        description: "Google's Gemini Omni Flash video model on the Gemini " +
            "API: text-to-video and image-to-video (including first-to-" +
            "last-frame interpolation) with native audio, reference-guided " +
            "generation from up to six images and short clips, and " +
            "natural-language editing and extension of existing videos, " +
            "either an uploaded clip or a previous interaction. 3-10 s " +
            "clips at 24 fps, 360p to 4k, 16:9 or 9:16.",
        homepageUrl: "https://ai.google.dev",
        docsUrl: "https://ai.google.dev/gemini-api/docs/omni",
        categories: ["video-generation"],
        notes: [
            "Generation is asynchronous (about 20 s to 2 min); the run " +
            "polls until the interaction settles and cannot be cancelled.",
            "By default the video is delivered by uri: the result's " +
            "`video.file` is the Files API id to pass to " +
            "`gemini#v1beta/files/{file}/download`. Files expire after 48 " +
            "hours.",
            "Billed per token on the interaction's usage: $1.50 / 1M input, " +
            "$9 / 1M text and thinking output, $17.50 / 1M video output " +
            "(720p is 5,792 tokens per second, about $0.10/s). The hold " +
            "estimates the video tokens from resolution and duration.",
            "Safety-filter rejections fail the run unbilled.",
        ],
    },
    auth: { inject: presets.auth.header("x-goog-api-key") },
    request: { baseUrl: "https://generativelanguage.googleapis.com" },
    timeouts: { requestMs: 120_000, runMs: 900_000, pollMs: 10_000 },
    usage: {
        credits: { default: { label: "US dollars" } },
    },
    output: {
        /** Google errors are `{error: {code, message, status}}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.error.message",
            );
            const status = utils.json.optionalGet(
                data.output,
                "$.error.status",
            );
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Gemini API error",
                ...(typeof status === "string" ? { code: status } : {}),
                raw: data.output,
            };
        },
    },
});
