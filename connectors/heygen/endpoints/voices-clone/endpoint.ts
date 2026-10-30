import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zUrlMedia } from "../../schema/media.ts";

/**
 * `POST /v3/models/audio/voices` with `mode: "instant"` - clone a voice
 * from one recording; PROVISIONS heygen/voice. HeyGen answers 202 with the
 * new `voice_id` while it checks the recording (usually ACTIVE within
 * seconds). Professional clones (paid slots, 20+ minutes of audio) are not
 * exposed.
 */
export const zCloneBody = z.object({
    name: z.string().min(1).max(64).describe(
        "Display name of the voice, 1-64 characters.",
    ),
    audio: z.array(zUrlMedia("recording (MP3, WAV or OGG)"))
        .length(1)
        .describe(
            "Exactly one recording of one speaker. Only the first 3 " +
                "minutes are used; 1-3 minutes of clear speech is ideal. Up " +
                "to 100 MiB, and it must download within 30 seconds.",
        ),
    language: z.string().describe(
        "Language code of the recording, such as `en`. Detected when " +
            "omitted.",
    ).optional(),
    similarity: z.enum(["medium", "high", "extra_high", "max"]).describe(
        "How closely the voice follows the recording. HeyGen defaults to " +
            "extra_high; HeyGen Studio uses max for the closest match.",
    ).optional(),
    remove_background_noise: z.boolean().describe(
        "Clean the recording before cloning. HeyGen defaults to true.",
    ).optional(),
    gender: z.enum(["male", "female"]).describe(
        "Detected when omitted. Not allowed together with `image`.",
    ).optional(),
    age: z.enum(["young", "old"]).describe(
        "Detected when omitted. Not allowed together with `image`.",
    ).optional(),
    image: zUrlMedia(
        "JPEG, PNG or WebP photo of the speaker in their " +
            "setting; the voice takes on its ambience",
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "HeyGen Clone Voice",
        summary: "Instant voice clone from one recording.",
        description: "Create a private instant voice from one recording " +
            "of one speaker, for /text-to-speech and /speech-to-speech. " +
            "Optionally steer how closely it follows the recording " +
            "(`similarity`), or give a photo of the speaker's setting to " +
            "shape its ambience. Returns `data.voice_id`; the voice is " +
            "usually ACTIVE within about 10 seconds - check with " +
            "/voices/get. Free to create and keep; delete it with " +
            "/voices/delete. Only clone voices you have the right to use.",
        docsUrl: "https://developers.heygen.com/docs/voices/" +
            "heygen-voice-instant-clone",
        categories: ["speech"],
        notes: [
            "`image` cannot be combined with `gender` or `age` (HeyGen " +
            "answers 400).",
            "A recording HeyGen cannot fetch or read still returns a " +
            "voice_id; the voice then ends FAILED with a failure_reason. " +
            "Delete it and clone again.",
        ],
    },
    endpoint: "/voices/clone",
    request: { method: "POST", path: "/v3/models/audio/voices" },
    input: {
        schema: { body: zCloneBody },
        toRequest: ({ data, utils }) => ({
            ...data.input,
            body: utils.json.merge(data.input.body ?? {}, { mode: "instant" }),
        }),
    },
    resources: {
        provisions: [{
            id: "heygen/voice",
            /** A 2xx with no readable id cannot be managed - the throw is
             *  the host's alarm. */
            seed: ({ data, utils }) => {
                const id = utils.json.optionalStr(
                    data.output,
                    "$.data.voice_id",
                );
                if (id === undefined || id === "") {
                    throw new Error(
                        "heygen returned success but no voice_id",
                    );
                }
                const name = String(
                    (data.input.body as Record<string, unknown>).name,
                );
                return {
                    resource: "heygen/voice",
                    externalId: id,
                    identifier: name,
                    data: { name },
                };
            },
        }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
