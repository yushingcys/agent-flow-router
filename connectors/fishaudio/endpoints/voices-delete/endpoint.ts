import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zVoicePathParams } from "../../schema/voice.ts";

/** DELETE /model/{id} - remove a voice this account owns. Free. */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Delete Cloned Voice",
        summary: "Delete a voice you cloned so it can no longer be used.",
        description: "Permanently delete a voice this account created " +
            "with fishaudio#voices/clone. Text to speech with its id fails " +
            "afterwards. Answers an empty body on success. Free.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/model/" +
            "delete-model",
        categories: ["speech"],
        notes: ["Irreversible."],
    },
    endpoint: "/voices/delete",
    request: { method: "DELETE", path: "/model/{id}" },
    input: { schema: { pathParams: zVoicePathParams } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
