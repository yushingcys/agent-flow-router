import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";

/**
 * `DELETE /v3/models/audio/voices/{voice_id}` - delete a cloned voice;
 * RELEASES heygen/voice. Gated: only the workspace that cloned it.
 */
export default defineEndpoint({
    meta: {
        displayName: "HeyGen Delete Cloned Voice",
        summary: "Delete a voice you cloned.",
        description: "Delete one of your cloned voices: HeyGen removes it " +
            "and /text-to-speech and /speech-to-speech stop accepting its " +
            "`voice_id`. Immediate; deleting a clone that is still PENDING " +
            "cancels it. Pass the `voice_id` returned by /voices/clone.",
        docsUrl:
            "https://developers.heygen.com/reference/delete-an-audio-voice",
        categories: ["speech"],
    },
    endpoint: "/voices/delete",
    request: { method: "DELETE", path: "/v3/models/audio/voices/{voice_id}" },
    input: {
        schema: {
            pathParams: z.object({
                voice_id: z.string().min(1).describe(
                    "A voice id returned by /voices/clone.",
                ),
            }).strict(),
        },
    },
    resources: {
        releases: [{ id: "heygen/voice", key: "$.pathParams.voice_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
