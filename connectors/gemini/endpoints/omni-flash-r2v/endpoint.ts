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
    endpoint: "/v1/video/omni-flash-r2v",
    meta: {
        displayName: "Reference to Video",
        summary:
            "Generate video featuring the people, objects or style of reference images and clips.",
        description:
            "Generate a new video with Gemini Omni Flash that features " +
            "the subjects, products or style shown in reference media " +
            "instead of animating a frame: up to 6 reference images and " +
            "3 reference clips (max 3 s each, their audio ignored), " +
            "bound in the prompt with <IMAGE_REF_N> / <VIDEO_REF_N> " +
            "tags. 3-10 s with native audio, 360p to 4k.",
        notes: [
            "Up to 6 reference images and 3 reference clips of at most " +
            "3 s each, plus one text block; each media block takes " +
            "exactly one of uri or data.",
            "The model cannot reason reliably across several reference " +
            "videos.",
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
                response_format: zResponseFormatBound,
                generation_config: zGenerationConfig("reference_to_video"),
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
