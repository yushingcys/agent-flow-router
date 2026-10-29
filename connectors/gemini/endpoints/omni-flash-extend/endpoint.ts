import { defineEndpoint } from "@shared/core";
import { z } from "zod";
import {
    estimateOmni,
    evidenceOmni,
    pollOmni,
    startOmni,
    tokenModel,
    zGenerationConfig,
    zImage,
    zModel,
    zResponseFormatBound,
    zText,
    zVideo,
} from "../../schema/omni.ts";

export default defineEndpoint({
    endpoint: "/v1/video/omni-flash-extend",
    meta: {
        displayName: "Extend Video",
        summary: "Continue a video seamlessly with Gemini Omni Flash.",
        description: "Continue an existing video with Gemini Omni Flash: the " +
            "model reads the last seconds of the source and generates " +
            "what happens next, keeping motion, characters and audio " +
            "coherent. Pass the source clip (at most 10 s) as a video " +
            "block, or extend a previous Omni interaction with " +
            "`previous_interaction_id`; up to 3 images can introduce " +
            "new characters (<IMAGE_REF_N>). Returns the source plus " +
            "3-10 s.",
        notes: [
            "Pass either one source video block (at most 10 s) or " +
            "`previous_interaction_id`, plus one text block and up to 3 " +
            "reference images. With `previous_interaction_id` the " +
            "explicit extend task is dropped, as Google requires.",
            "Extension only appends to the end; extending uploaded " +
            "videos is not available in the EEA, Switzerland or the UK.",
        ],
    },
    request: { method: "POST", path: "/v1beta/interactions" },
    input: {
        schema: {
            body: z.object({
                model: zModel.default("gemini-omni-1.1-flash"),
                input: z
                    .array(z.union([zText, zImage, zVideo]))
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
                generation_config: zGenerationConfig("extend"),
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
