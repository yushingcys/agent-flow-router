import { defineProvider, presets } from "@shared/core";

/**
 * HeyGen (heygen.com) - HeyGen's own generation models over the v3 REST API
 * at `https://api.heygen.com`, auth `x-api-key` (docs read 2026-10-29):
 *   - HeyGen Video (`heygen-video-1`, POST /v3/models/videos): text, image or
 *     reference to video with generated sound. Asynchronous: submit, then
 *     poll GET /v3/models/videos/{video_id}.
 *   - HeyGen Voice (`/v3/models/audio/*`): public voices, instant clones,
 *     text-to-speech and speech-to-speech. Synchronous: one call returns a
 *     WAV link.
 *
 * POOLED TENANCY: Agent Flow holds one HeyGen workspace for every caller,
 * so a cloned voice is an OWNED RESOURCE (heygen/voice). Delete is gated to
 * the owner; get / speak / re-voice accept a voice the caller owns or a
 * HeyGen public voice, never another tenant's clone. Media inputs are
 * public https URLs only: an `asset_id` would name a file in the shared
 * workspace, and inline base64 would bloat the run record.
 *
 * BILLING in US dollars - HeyGen's API wallet is dollar-denominated. Rates
 * are HeyGen's self-serve API prices as Monid lists them with no markup
 * (monid.ai/tools/heygen, read 2026-10-29; platform.heygen.com/pricing is a
 * signed-in dashboard). No response carries a dollar figure, so there is no
 * `usage.consolidate`: the derived fold is the bill.
 */
export default defineProvider({
    name: "heygen",
    meta: {
        displayName: "HeyGen",
        summary:
            "HeyGen Video and HeyGen Voice - video with sound, speech, voice clones.",
        description: "HeyGen's own generation models. HeyGen Video turns " +
            "a prompt, a first-frame image or reference images, videos and " +
            "audio into a 5-30 s clip with generated dialogue, effects and " +
            "ambience at 480p to 2k, billed per second. HeyGen Voice speaks " +
            "text or re-voices a recording with a public voice or an " +
            "instant clone of your own recording, billed per character or " +
            "per second, with a free Turbo model for a limited time. " +
            "Outputs are download links.",
        homepageUrl: "https://www.heygen.com",
        docsUrl: "https://developers.heygen.com",
        categories: ["video-generation", "speech"],
        notes: [
            "Media inputs (recordings, images, reference clips) must be " +
            "public https:// URLs HeyGen can fetch without redirects; " +
            "asset ids and inline base64 are not accepted.",
            "Output links (video_url, audio_url) are signed and expire - " +
            "download them promptly.",
            "Cloned voices are workspace-owned: only the workspace that " +
            "cloned a voice can read, use or delete it.",
        ],
    },
    auth: { inject: presets.auth.header("x-api-key") },
    request: { baseUrl: "https://api.heygen.com" },
    // video jobs run minutes (a 30 s 2k clip longer); speech-to-speech
    // overrides requestMs for its 150 s synchronous conversion
    timeouts: { requestMs: 60_000, runMs: 1_800_000, pollMs: 10_000 },
    usage: { credits: { default: { label: "US dollars" } } },
    output: {
        /** HeyGen errors are `{error: {code, message, param, doc_url}}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalStr(
                data.output,
                "$.error.message",
            );
            const code = utils.json.optionalStr(data.output, "$.error.code");
            return {
                message: message !== undefined && message !== ""
                    ? message
                    : "HeyGen API error",
                ...(code !== undefined ? { code } : {}),
                raw: data.output,
            };
        },
    },
});
