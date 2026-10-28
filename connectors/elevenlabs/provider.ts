import { defineProvider, presets } from "@shared/core";

/**
 * ElevenLabs (elevenlabs.io) - speech, sound and music generation plus
 * audio processing, at `https://api.elevenlabs.io`, auth `xi-api-key`.
 *
 * BYTES (engine 0.6.0): most ElevenLabs endpoints answer with raw audio or
 * take a multipart file upload. Those endpoints are LIFECYCLE docs whose
 * `start` relays the call through `utils.request` - multipart where the
 * vendor takes a file (`{base64, contentType?, filename?}` in the caller's
 * JSON body), and a binary response arrives decoded as
 * `{contentType, base64}`. Text-to-speech and dialogue use the vendor's own
 * `/with-timestamps` JSON variants (base64 audio plus alignment), so they
 * stay declarative.
 *
 * BILLING in US dollars at ElevenLabs' published API prices
 * (elevenlabs.io/pricing/api, read 2026-10-27), which are also Monid's
 * listing: TTS $0.08 / 1K characters ($0.04 on Flash/Turbo), Scribe $0.22 /
 * audio hour (+$0.05 keyterms, +$0.07 transcript editing), sound effects,
 * voice changer and voice isolator $0.12 / minute, music $0.15 / minute,
 * forced alignment $0.22 / hour. No response carries a dollar figure, so
 * there is no `usage.consolidate`: the derived fold is the bill.
 */
export default defineProvider({
    name: "elevenlabs",
    meta: {
        displayName: "ElevenLabs",
        summary: "Lifelike speech, transcription, sound effects and music.",
        description: "Voice AI from ElevenLabs: turn text into lifelike " +
            "speech or multi-speaker dialogue with any of thousands of " +
            "voices, transcribe audio and video in 90+ languages with " +
            "Scribe, generate sound effects and full songs from a prompt, " +
            "re-voice a recording, strip background noise from speech, and " +
            "align a known transcript to its audio. Audio comes back " +
            "base64-encoded in the response; uploads take base64 audio in " +
            "the request body.",
        homepageUrl: "https://elevenlabs.io",
        docsUrl: "https://elevenlabs.io/docs/api-reference/introduction",
        categories: ["speech", "audio", "music-generation"],
    },
    auth: { inject: presets.auth.header("xi-api-key") },
    request: { baseUrl: "https://api.elevenlabs.io" },
    /** Music runs up to 10 minutes of audio and blocks while it renders. */
    timeouts: { requestMs: 300_000, runMs: 320_000 },
    usage: {
        /** ElevenLabs' API card is published in dollars, so the pool IS
         *  dollars (the minimax shape). */
        credits: { default: { label: "US dollars" } },
    },
    output: {
        /** ElevenLabs errors are `{detail: {status, message}}`, or FastAPI
         *  validation lists `{detail: [{loc, msg, type}]}` on 422. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.detail.message",
            );
            const first = utils.json.optionalGet(
                data.output,
                "$.detail[0].msg",
            );
            const status = utils.json.optionalGet(
                data.output,
                "$.detail.status",
            );
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : typeof first === "string" && first !== ""
                    ? first
                    : "ElevenLabs API error",
                ...(typeof status === "string" ? { code: status } : {}),
                raw: data.output,
            };
        },
    },
});
