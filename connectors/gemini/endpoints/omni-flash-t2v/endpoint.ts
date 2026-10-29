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
} from "../../schema/omni.ts";

export default defineEndpoint({
    endpoint: "/v1/video/omni-flash-t2v",
    meta: {
        displayName: "Text to Video",
        summary: "Text-to-video with Gemini Omni Flash, native audio included.",
        description:
            "Turn a text prompt into a 3-10 s video with synchronized " +
            "audio (speech, music, ambience) using Gemini Omni Flash: " +
            'timed events ("after 3 seconds ..." or [0-3s] timecodes), ' +
            "multi-shot storyboards, on-screen text, and " +
            "single-continuous-shot prompting, at 360p to 4k in 16:9 or " +
            "9:16.",
    },
    request: { method: "POST", path: "/v1beta/interactions" },
    input: {
        schema: {
            body: z.object({
                model: zModel.default("gemini-omni-1.1-flash"),
                input: z.string().min(1).describe(
                    "The prompt: scene, subject, motion, camera, timing and audio.",
                ),
                response_format: zResponseFormatBound,
                generation_config: zGenerationConfig("text_to_video"),
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
