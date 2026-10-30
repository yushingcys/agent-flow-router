import { defineEndpoint } from "@shared/core";
import { z } from "zod";
import {
    estimateOmni,
    evidenceOmni,
    pollOmni,
    startOmni,
    tokenModel,
    zGenerationConfig,
    zModel,
    zResponseFormatBound,
    zText,
    zVideo,
} from "../../schema/omni.ts";

export default defineEndpoint({
    endpoint: "/v1/video/omni-flash-edit",
    meta: {
        displayName: "Edit Video",
        summary:
            "Edit a video with a natural-language instruction using Gemini Omni Flash.",
        description:
            "Modify an existing video with Gemini Omni Flash: restyle " +
            "it, swap or remove objects, change lighting, backgrounds " +
            "or on-screen text while the rest of the clip is preserved. " +
            "Pass the source clip (at most 10 s) as a video block, or " +
            "continue from a previous Omni interaction with " +
            "`previous_interaction_id`. Returns an MP4 of the source " +
            "length with native audio.",
        notes: [
            "Pass either one source video block (at most 10 s) or " +
            "`previous_interaction_id`, plus one text block. With " +
            "`previous_interaction_id` the explicit edit task is " +
            "dropped, as Google requires.",
            "Editing uploaded videos is not available in the EEA, " +
            "Switzerland or the UK; voice editing is not supported.",
            'Keep edit prompts surgical ("Change the car to blue. Keep ' +
            'everything else the same.").',
        ],
    },
    request: { method: "POST", path: "/v1beta/interactions" },
    input: {
        schema: {
            body: z.object({
                model: zModel.default("gemini-omni-1.1-flash"),
                input: z
                    .array(z.union([zText, zVideo]))
                    .min(1)
                    .describe(
                        "Content blocks: the media and one text prompt, in the order <IMAGE_REF_N> / <VIDEO_REF_N> tags count them.",
                    ),
                previous_interaction_id: z
                    .string()
                    .describe(
                        "Id of an earlier Omni interaction whose video to work on, instead of a source video block.",
                    )
                    .optional(),
                response_format: zResponseFormatBound,
                generation_config: zGenerationConfig("edit"),
            }).strict(),
        },
    },
    lifecycle: { start: startOmni, poll: pollOmni },
    usage: {
        model: tokenModel,
        estimate: estimateOmni,
        evidence: evidenceOmni,
    },
});
