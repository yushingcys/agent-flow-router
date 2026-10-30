import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { voiceGateStart } from "../../schema/voice-gate.ts";

/**
 * `GET /v3/models/audio/voices/{voice_id}` - one public voice or one this
 * workspace cloned, behind the shared voice gate.
 */
export default defineEndpoint({
    meta: {
        displayName: "HeyGen Get Voice",
        summary: "Read one voice and its status (PENDING, ACTIVE, FAILED).",
        description: "Read a single voice - a HeyGen public voice or one " +
            "you cloned - by `voice_id`. Returns its `name`, `mode`, " +
            "`language`, `status` (PENDING while a new clone is being " +
            "prepared, then ACTIVE, or FAILED with a `failure_reason`) and " +
            "a `preview_audio_url`. Use it to wait for a new clone to " +
            "become ACTIVE before /text-to-speech.",
        docsUrl: "https://developers.heygen.com/reference/get-an-audio-voice",
        categories: ["speech"],
    },
    endpoint: "/voices/get",
    request: { method: "GET", path: "/v3/models/audio/voices/{voice_id}" },
    input: {
        schema: {
            pathParams: z.object({
                voice_id: z.string().min(1).describe(
                    "A public voice id from /voices, or one returned by " +
                        "/voices/clone.",
                ),
            }).strict(),
        },
    },
    /** Keyless: unlocks the ownership window the gate reads. */
    resources: { reads: [{ id: "heygen/voice" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
    lifecycle: { start: voiceGateStart },
});
