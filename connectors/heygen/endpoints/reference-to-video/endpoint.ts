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
 * HeyGen Video reference-to-video: `POST /v3/models/videos` with
 * `mode: "reference_to_video"`, then poll. Three metered quantities: output
 * seconds and the reference-video seconds HeyGen reads (both at the
 * resolution's rate, the latter reported as `input_video_duration`), plus
 * each reference image after the first two.
 */
export const zR2vBody = z.object({
    model: z.literal("heygen-video-1").optional(),
    mode: z.literal("reference_to_video").optional(),
    prompt: zPrompt,
    reference_images: z.array(zUrlMedia("reference image")).max(9).describe(
        "Up to 9 images, addressed in the prompt as <Picture 1>, <Picture " +
            "2>, ... in list order. Each after the first two bills $0.04.",
    ).optional(),
    reference_videos: z.array(zUrlMedia("reference video")).max(3).describe(
        "Up to 3 videos, addressed as <Video 1>, ... They share a 15-second " +
            "input budget (each keeps up to its first 5 s when they do not " +
            "fit), billed per second at the resolution's rate.",
    ).optional(),
    reference_audio: z.array(zUrlMedia("reference audio")).max(3).describe(
        "Up to 3 audio clips, addressed as <Audio 1>, ...",
    ).optional(),
    duration: z.union([
        z.number().int().min(5).max(15),
        z.literal("auto"),
    ]).describe(
        "Whole seconds, 5-15, or auto to size the clip to the quoted " +
            "dialogue (8 s minimum). HeyGen defaults to 5.",
    ).optional(),
    resolution: zResolution.optional(),
    prompt_enhancement: zPromptEnhancement.optional(),
    aspect_ratio: z
        .enum(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "adaptive"])
        .describe(
            "Output shape. HeyGen defaults to adaptive: the first reference " +
                "image's ratio (or first video's), at 480p and 768p only.",
        ).optional(),
    seed: zSeed.optional(),
}).strict();

const s = zR2vBody.shape;

export default defineEndpoint({
    meta: {
        displayName: "HeyGen Reference to Video",
        summary:
            "Video with sound guided by reference images, videos and audio.",
        description: "Keep characters, products, places, motion or voices " +
            "consistent: heygen-video-1 (HeyGen's model built on MiniMax " +
            "H3) generates a clip guided by reference images, videos and " +
            "audio that the prompt names by position (<Picture 1>, <Video " +
            "1>, <Audio 1>). 5 to 15 seconds at 480p, 768p, 1080p or 2k. " +
            "Returns the job record with `video_url`, `duration` and " +
            "`input_video_duration`. Per second of output and of " +
            "reference video read: 480p $0.07, 768p $0.10, 1080p/2k $0.18; " +
            "plus $0.04 per reference image after the first two.",
        docsUrl: "https://developers.heygen.com/docs/models/heygen-video",
        categories: ["video-generation"],
        notes: [
            "At least one reference image or video is required (HeyGen " +
            "answers 400 otherwise); at most 15 references in total.",
            "1080p and 2k render only 16:9 or 9:16 - set aspect_ratio, " +
            "since adaptive resolves at 480p and 768p only.",
            "Generation is asynchronous and runs to completion once " +
            "submitted - there is no cancel.",
            "The hold prices the full 15-second reference-video budget " +
            "when any reference video is sent; the bill is what HeyGen " +
            "reports reading.",
        ],
    },
    endpoint: "/v1/video/heygen-video-1-r2v",
    request: { method: "POST", path: "/v3/models/videos" },
    input: {
        schema: {
            body: zR2vBody.extend({
                model: s.model.unwrap().default("heygen-video-1"),
                mode: s.mode.unwrap().default("reference_to_video"),
                duration: s.duration.unwrap().default(5),
                resolution: s.resolution.unwrap().default("768p"),
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
                    consumes: { credit: "default", amount: 0.07 },
                    label: "480p seconds",
                },
                "480p_input_video": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.07 },
                    label: "480p reference-video seconds",
                },
                "768p": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.1 },
                    label: "768p seconds",
                },
                "768p_input_video": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.1 },
                    label: "768p reference-video seconds",
                },
                "1080p": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.18 },
                    label: "1080p seconds",
                },
                "1080p_input_video": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.18 },
                    label: "1080p reference-video seconds",
                },
                "2k": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.18 },
                    label: "2k seconds",
                },
                "2k_input_video": {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.18 },
                    label: "2k reference-video seconds",
                },
                extra_image: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.04 },
                    label: "reference images after the first two",
                },
            },
        },
        estimate: ({ data }) => {
            const b = data.input.body;
            const r = b.resolution;
            const images = Math.max(0, (b.reference_images?.length ?? 0) - 2);
            const videos = (b.reference_videos?.length ?? 0) > 0 ? 15 : 0;
            return {
                counts: {
                    [r]: b.duration === "auto" ? 15 : b.duration,
                    ...(videos > 0 ? { [r + "_input_video"]: videos } : {}),
                    ...(images > 0 ? { extra_image: images } : {}),
                },
            };
        },
        evidence: ({ data, utils }) => {
            const seconds = utils.json.optionalNum(data.output, "$.duration") ??
                0;
            if (seconds <= 0) return { counts: {} };
            const b = data.input.body;
            const r = b.resolution;
            const read = Math.ceil(
                utils.json.optionalNum(data.output, "$.input_video_duration") ??
                    0,
            );
            const images = Math.max(0, (b.reference_images?.length ?? 0) - 2);
            return {
                counts: {
                    [r]: seconds,
                    ...(read > 0 ? { [r + "_input_video"]: read } : {}),
                    ...(images > 0 ? { extra_image: images } : {}),
                },
            };
        },
    },
    lifecycle: { start: videoStart, poll: videoPoll },
});
