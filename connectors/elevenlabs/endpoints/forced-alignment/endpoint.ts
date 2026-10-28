import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAlignmentBody } from "./schema/inputs.ts";

/**
 * Forced alignment - multipart upload, JSON back. $0.22 per audio hour,
 * folded per second; the response has no duration field, so evidence is
 * the end time of the last aligned word.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Forced Alignment",
        summary: "Align a known transcript to its audio, word by word.",
        description: "Given a recording and the text spoken in it, return " +
            "precise `words` and `characters` with start and end times, " +
            "plus an overall `loss` (lower is a better fit) - for " +
            "subtitles, audiobook read-along, karaoke and lip-sync. Pass " +
            "the audio as {base64, contentType, filename}. $0.22 per audio " +
            "hour, billed per second.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/forced-alignment/" +
            "create",
        categories: ["speech"],
        notes: [
            "The estimate assumes compressed audio at 32 kbps from the " +
            "upload's size; the run settles on the aligned duration.",
        ],
    },
    request: { method: "POST", path: "/v1/forced-alignment" },
    input: { schema: { body: zAlignmentBody } },
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
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.SECOND,
            consumes: { credit: "default", amount: 0.22 / 3600 },
            label: "seconds of audio",
            description: "$0.22 per audio hour",
        },
        estimate: ({ data }) => {
            const file = data.input.body.file;
            const bytes = Math.floor(file.base64.length * 3 / 4);
            const raw = /wav|pcm/.test(file.contentType ?? "");
            return {
                counts: { SECOND: Math.ceil(bytes / (raw ? 32000 : 4000)) },
            };
        },
        evidence: ({ data, utils }) => {
            const words = utils.json.optionalGet(data.output, "$.words");
            const ends = Array.isArray(words)
                ? words.map((w) =>
                    typeof w === "object" && w !== null && !Array.isArray(w) &&
                        typeof w.end === "number"
                        ? w.end
                        : 0
                )
                : [];
            return { counts: { SECOND: Math.ceil(Math.max(0, ...ends)) } };
        },
    },
});
