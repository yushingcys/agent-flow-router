import { z } from "zod";
import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zUrlMedia } from "../../schema/media.ts";
import {
    videoPoll,
    videoStart,
    zPrompt,
    zPromptEnhancement,
    zResolution,
    zSeed,
} from "../../schema/video.ts";

/**
 * HeyGen Video image-to-video: `POST /v3/models/videos` with
 * `mode: "image_to_video"` and the image as the literal first frame, then
 * poll. Same rates as text-to-video. Rate card per second of output by
 * resolution, with a higher per-second rate for the WHOLE clip once it
 * runs past 15 s (Monid's "clip over 15 s" tier, no markup).
 */
export const zI2vBody = z.object({
    model: z.literal("heygen-video-1").optional(),
    mode: z.literal("image_to_video").optional(),
    prompt: zPrompt,
    image: zUrlMedia(
        "first frame (JPEG, PNG or WebP, up to 16 MB); the clip opens " +
            "exactly as it looks and keeps its proportions",
    ),
    duration: z.union([
        z.number().int().min(5).max(30),
        z.literal("auto"),
    ]).describe(
        "Whole seconds, 5-30 (5-15 with ultraquality or disabled " +
            "enhancement), or auto to size the clip to the quoted " +
            "dialogue (8 s minimum). HeyGen defaults to 5. Clips over 15 s " +
            "bill at a higher per-second rate.",
    ).optional(),
    resolution: zResolution.optional(),
    prompt_enhancement: zPromptEnhancement.optional(),
    seed: zSeed.optional(),
}).strict();

const s = zI2vBody.shape;

export default defineEndpoint({
    meta: {
        displayName: "HeyGen Image to Video",
        summary: "Animate an image with generated sound, HeyGen Video 1.",
        description: "Bring a still image to life: heygen-video-1 " +
            "(HeyGen's model built on MiniMax H3) opens on your picture as " +
            "the first frame and follows the prompt for motion, camera and " +
            "sound (dialogue in double quotes is voiced). 5 to 30 seconds " +
            "at 480p, 768p, 1080p or 2k; the output keeps the image's " +
            "proportions. Returns the job record with `video_url` " +
            "(MP4, 24 fps, AAC audio), `duration`, `width`, `height` and " +
            "`seed`. Billed per second of output: 480p $0.02, 768p $0.036, " +
            "1080p/2k $0.10; clips over 15 s $0.045 / $0.075 / $0.105 per " +
            "second.",
        docsUrl: "https://developers.heygen.com/docs/models/heygen-video",
        categories: ["video-generation"],
        notes: [
            "Clips over 15 seconds need turbo or quality prompt " +
            "enhancement; ultraquality and disabled cap at 15 s (HeyGen " +
            "rejects a longer duration with 400).",
            "The output follows the image's aspect ratio (EXIF " +
            "orientation included) - crop it first to change the shape.",
            "Generation is asynchronous and runs to completion once " +
            "submitted - there is no cancel.",
            "A clip over 15 seconds bills every second at the long-clip " +
            "rate. duration auto holds the 30 s maximum (15 s with " +
            "ultraquality or disabled) and settles on the length HeyGen " +
            "picked.",
        ],
    },
    endpoint: "/v1/video/heygen-video-1-i2v",
    request: { method: "POST", path: "/v3/models/videos" },
    input: {
        schema: {
            body: zI2vBody.extend({
                model: s.model.unwrap().default("heygen-video-1"),
                mode: s.mode.unwrap().default("image_to_video"),
                duration: s.duration.unwrap().default(5),
                resolution: s.resolution.unwrap().default("768p"),
                prompt_enhancement: s.prompt_enhancement.unwrap()
                    .default("quality"),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                "480p": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.02 },
                    label: "480p seconds",
                },
                "480p_long": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.045 },
                    label: "480p seconds, clip over 15 s",
                },
                "768p": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.036 },
                    label: "768p seconds",
                },
                "768p_long": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.075 },
                    label: "768p seconds, clip over 15 s",
                },
                "1080p": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.1 },
                    label: "1080p seconds",
                },
                "1080p_long": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.105 },
                    label: "1080p seconds, clip over 15 s",
                },
                "2k": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.1 },
                    label: "2k seconds",
                },
                "2k_long": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.105 },
                    label: "2k seconds, clip over 15 s",
                },
            },
        },
        estimate: ({ data }) => {
            const b = data.input.body;
            const long = b.prompt_enhancement === "turbo" ||
                b.prompt_enhancement === "quality";
            const seconds = b.duration === "auto"
                ? (long ? 30 : 15)
                : b.duration;
            const key = seconds > 15 ? b.resolution + "_long" : b.resolution;
            return { counts: { [key]: seconds } };
        },
        /** The completed job's `duration` (whole seconds) is what HeyGen
         *  bills, `auto` included; the resolution is the request's. */
        evidence: ({ data, utils }) => {
            const seconds = utils.json.optionalNum(data.output, "$.duration") ??
                0;
            if (seconds <= 0) return { counts: {} };
            const r = data.input.body.resolution;
            return {
                counts: { [seconds > 15 ? r + "_long" : r]: seconds },
            };
        },
    },
    lifecycle: { start: videoStart, poll: videoPoll },
});
