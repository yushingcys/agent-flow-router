import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCloneBody } from "./schema/inputs.ts";

/**
 * POST /model - multipart (the recordings are file parts), so a lifecycle
 * relay with `bodyEncoding: "multipart"`. `type` and `train_mode` each have
 * one legal value; the binding fills them. Free.
 */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Clone Voice",
        summary: "Clone a voice from recordings into a reusable voice id.",
        description: "Create a private voice from 1-20 recordings (WAV, " +
            "MP3 or FLAC; 10-30 s of clean speech each works best), each " +
            "passed as {base64, contentType, filename}. The voice is ready " +
            "at once; use the returned `_id` as `reference_id` in " +
            "fishaudio#text-to-speech. Add `texts` for better fidelity, or " +
            "pass `voice_design_signatures` to save candidates from " +
            "fishaudio#voice-design. Free.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/model/" +
            "create-model",
        categories: ["speech"],
    },
    endpoint: "/voices/clone",
    request: { method: "POST", path: "/model" },
    input: {
        schema: {
            body: zCloneBody.extend({
                type: zCloneBody.shape.type.default("tts"),
                train_mode: zCloneBody.shape.train_mode.default("fast"),
            }),
        },
    },
    lifecycle: {
        start: async ({ utils }) => {
            const res = await utils.request({ bodyEncoding: "multipart" });
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
