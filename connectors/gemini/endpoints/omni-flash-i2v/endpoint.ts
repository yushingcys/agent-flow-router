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
} from "../../schema/omni.ts";

export default defineEndpoint({
    endpoint: "/v1/video/omni-flash-i2v",
    meta: {
        displayName: "Image to Video",
        summary:
            "Animate a still image, or interpolate from a first to a last frame, with Gemini Omni Flash.",
        description: "Bring a still image to life with Gemini Omni Flash, or " +
            "pass two images to generate the transition from a starting " +
            "to an ending frame. Describe motion, camera and sound in " +
            "the text block. 3-10 s with native audio, 360p to 4k, 16:9 " +
            "or 9:16.",
        notes: [
            "Pass one image (the first frame) or two (first and last " +
            "frame) plus one text block; images are png, jpeg, webp, " +
            "heic, heif or gif, each with exactly one of uri or data.",
        ],
    },
    request: { method: "POST", path: "/v1beta/interactions" },
    input: {
        schema: {
            body: z.object({
                model: zModel.default("gemini-omni-1.1-flash"),
                input: z
                    .array(z.union([zText, zImage]))
                    .min(1)
                    .describe(
                        "Content blocks: the media and one text prompt, in the order <IMAGE_REF_N> / <VIDEO_REF_N> tags count them.",
                    ),
                response_format: zResponseFormatBound,
                generation_config: zGenerationConfig("image_to_video"),
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
