import { defineProvider, presets } from "@shared/core";

/**
 * Fish Audio (fish.audio) - text to speech across 2M+ community voices,
 * voice cloning and design, and transcription. One Bearer-auth API at
 * `https://api.fish.audio`.
 *
 * The model is a REQUEST HEADER (`model: s2.1-pro`), which a caller's input
 * cannot express, so the model-selecting endpoints take a `model` body
 * field and a lifecycle `start` moves it into the header. Audio comes back
 * base64 (engine 0.6.0 decodes raw responses to `{contentType, base64}`);
 * uploads take base64 audio and go out multipart.
 *
 * BILLING in US dollars at Fish Audio's pay-as-you-go card
 * (docs.fish.audio pricing-and-rate-limits, read 2026-10-27; Monid lists the
 * same): TTS $15 per million UTF-8 bytes of text ($50 on drama-3), speech to
 * text $0.36 per audio hour rounded up to the second, voice design $0.01 per
 * successful request; voice library and model management are free. No
 * response reports a cost, so the derived fold is the bill.
 */
export default defineProvider({
    name: "fishaudio",
    meta: {
        displayName: "Fish Audio",
        summary: "Expressive text to speech, voice cloning and transcription.",
        description: "Fish Audio's voice platform: speak text with any of " +
            "2M+ library voices or your own clone (with optional word-level " +
            "timings), clone a voice from a few recordings, design a new " +
            "voice from a text description, transcribe recordings with " +
            "speaker labels, and search, inspect or delete voices. Audio " +
            "comes back base64-encoded; uploads take base64 audio in the " +
            "request body.",
        homepageUrl: "https://fish.audio",
        docsUrl: "https://docs.fish.audio/api-reference/introduction",
        categories: ["speech"],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.fish.audio" },
    timeouts: { requestMs: 180_000, runMs: 200_000 },
    usage: {
        credits: { default: { label: "US dollars" } },
    },
    output: {
        /** Fish errors are `{status, message, reason?}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(data.output, "$.message");
            const reason = utils.json.optionalGet(data.output, "$.reason");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : typeof data.output === "string" && data.output !== ""
                    ? data.output
                    : "Fish Audio API error",
                ...(typeof reason === "string" ? { code: reason } : {}),
                raw: data.output,
            };
        },
    },
});
