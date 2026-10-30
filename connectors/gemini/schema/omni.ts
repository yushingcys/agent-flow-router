import { z } from "zod";
import {
    type EstimateData,
    type FnUsage,
    type FnUtils,
    type HookLogger,
    type Json,
    type LifecycleOutcome,
    type LifecycleStartData,
    type LifecycleTickData,
    type LifecycleUtils,
    Unit,
    UsageModelKind,
} from "@shared/core";

/**
 * Gemini Omni Flash on the Interactions API
 * (`POST /v1beta/interactions`), shared by every `gemini#v1/video/*`
 * endpoint: the request fragments, the background start / poll lifecycle,
 * the token rate card and its estimate. Mirrored from the google-genai
 * SDK's generated Interactions types (`createmodelinteraction`,
 * `videoresponseformat`, `videoconfig`, `imagecontent`, `videocontent`,
 * `usage`) and the Omni cookbook (google-gemini/cookbook
 * quickstarts/Get_started_Omni.ipynb), read 2026-10-29.
 */

export const zModel = z
    .enum(["gemini-omni-1.1-flash"])
    .describe("Gemini Omni Flash 1.1, the GA Omni model.");

const zMediaUri = z
    .string()
    .regex(/^https:\/\/\S+$/, "must be an https:// URL")
    .describe(
        "Public https:// URL of the media, or a Gemini Files API uri " +
            "(https://generativelanguage.googleapis.com/v1beta/files/...).",
    );

const zBase64 = z.string().min(1).describe("The media bytes, base64-encoded.");

export const zText = z.object({
    type: z.literal("text"),
    text: z.string().min(1).describe(
        "The prompt: scene, motion, camera, timing ([0-3s] ...) and audio. " +
            "Bind images with <IMAGE_REF_N> / <VIDEO_REF_N> (0-indexed in " +
            "input order).",
    ),
}).strict();

export const zImage = z.object({
    type: z.literal("image"),
    uri: zMediaUri.optional(),
    data: zBase64.optional(),
    mime_type: z
        .enum([
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/heic",
            "image/heif",
            "image/gif",
        ])
        .describe("The image's mime type.")
        .optional(),
}).strict();

export const zVideo = z.object({
    type: z.literal("video"),
    uri: zMediaUri.optional(),
    data: zBase64.optional(),
    mime_type: z
        .enum([
            "video/mp4",
            "video/mpeg",
            "video/mpg",
            "video/mov",
            "video/avi",
            "video/x-flv",
            "video/webm",
            "video/wmv",
            "video/3gpp",
        ])
        .describe("The video's mime type.")
        .optional(),
}).strict();

/** `response_format` for video. Defaults are applied at the bindings. */
export const zResponseFormat = z.object({
    type: z.literal("video").describe("Always video."),
    aspect_ratio: z
        .enum(["16:9", "9:16"])
        .describe("Frame shape; Google defaults to 16:9.")
        .optional(),
    resolution: z
        .enum(["360p", "720p", "1080p", "4k"])
        .describe(
            "Output resolution (Google's default 720p). 360p is a fast " +
                "draft; 1080p and 4k are upscaled. Selects the per-second " +
                "token rate.",
        ),
    duration: z
        .string()
        .regex(/^([3-9]|10)s$/, "3s to 10s")
        .describe(
            "Length of the generated video, 3s to 10s. Omitted, the model " +
                "picks it from the prompt.",
        )
        .optional(),
    delivery: z
        .enum(["uri", "inline"])
        .describe(
            "uri (the default here): the video is stored in the Gemini " +
                "Files API and the result carries its file id for " +
                "`gemini#v1beta/files/{file}/download`. inline: the MP4 " +
                "comes back base64 in the result (large).",
        ),
}).strict();

export function zGenerationConfig<const T extends string>(task: T) {
    return z.object({
        thinking_level: z
            .enum(["low", "high"])
            .describe(
                "Planning depth before rendering: high reasons through " +
                    "physics and timing (more thinking tokens), low is " +
                    "faster.",
            )
            .optional(),
        seed: z.number().int().describe("Best-effort reproducibility.")
            .optional(),
        video_config: z.object({
            task: z.literal(task).describe(
                "The Omni task mode this endpoint runs.",
            ).default(task),
        }).strict().prefault({}),
    }).strict().prefault({});
}

/** The binding-level response_format: resolution 720p and uri delivery
 *  materialized so the estimate and the output shape are deducible. */
export const zResponseFormatBound = zResponseFormat.extend({
    type: zResponseFormat.shape.type.default("video"),
    resolution: zResponseFormat.shape.resolution.default("720p"),
    delivery: zResponseFormat.shape.delivery.default("uri"),
}).prefault({});

/**
 * Google bills Omni per token (ai.google.dev/gemini-api/docs/pricing,
 * paid tier, as quoted 2026-08/10 by several independent guides; the page
 * itself was unreachable from this network): input $1.50 / 1M (text,
 * image, video), text and thinking output $9 / 1M, video output $17.50 /
 * 1M, with 720p video at 5,792 tokens per second (about $0.10/s).
 */
export const tokenModel = {
    kind: UsageModelKind.COMPOSITE,
    components: {
        input_token: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            consumes: { credit: "default", amount: 1.5 / 1e6 },
            label: "input",
            description: "$1.50 per 1M input tokens (text, image, video)",
        },
        text_output_token: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            consumes: { credit: "default", amount: 9 / 1e6 },
            label: "text and thinking output",
            description: "$9 per 1M text and thinking output tokens",
        },
        video_output_token: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            consumes: { credit: "default", amount: 17.5 / 1e6 },
            label: "video output",
            description: "$17.50 per 1M video output tokens",
        },
    },
} as const;

type BoundBody = {
    response_format: { resolution: string; duration?: string };
    generation_config: { video_config: { task: string } };
};

/**
 * The pre-run hold: video output tokens for the requested seconds at the
 * resolution's rate. 720p is Google's published 5,792 tokens/s; the other
 * tiers scale it by Monid's per-second card (360p 0.04, 720p 0.11, 1080p
 * 0.16, 4k 0.31 USD). ponytail: no duration holds the 10 s maximum (an
 * extension also holds the up-to-10 s source it returns), and input and
 * thinking tokens are not held; the run settles on Google's usage.
 */
export const estimateOmni = (
    { data }: {
        data: Omit<EstimateData, "input"> & { input: { body: BoundBody } };
    },
): FnUsage => {
    const body = data.input.body;
    const PER_SECOND: Record<string, number> = {
        "360p": 2106,
        "720p": 5792,
        "1080p": 8425,
        "4k": 16323,
    };
    const d = body.response_format.duration;
    const seconds = (d === undefined ? 10 : Number(d.slice(0, -1))) +
        (body.generation_config.video_config.task === "extend" ? 10 : 0);
    return {
        counts: {
            input_token: 0,
            text_output_token: 0,
            video_output_token: seconds *
                (PER_SECOND[body.response_format.resolution] ?? 5792),
        },
    };
};

/** Settle on the interaction's own `usage`. A completed interaction
 *  without video output tokens falls back to the hold's video line (a
 *  vendor anomaly, said out loud) rather than giving the video away. */
export const evidenceOmni = (
    { data, utils, logger }: {
        data: {
            input: { body: BoundBody };
            output: Json;
        };
        utils: FnUtils;
        logger: HookLogger;
    },
): FnUsage => {
    const byModality = (path: string, modality: string) => {
        const list = utils.json.optionalGet(data.output, path);
        let n = 0;
        if (Array.isArray(list)) {
            for (const m of list) {
                if (
                    m !== null && typeof m === "object" && !Array.isArray(m) &&
                    m.modality === modality && typeof m.tokens === "number"
                ) n += m.tokens;
            }
        }
        return n;
    };
    const input = utils.json.optionalNum(
        data.output,
        "$.usage.total_input_tokens",
    ) ?? 0;
    const thought = utils.json.optionalNum(
        data.output,
        "$.usage.total_thought_tokens",
    ) ?? 0;
    const text = byModality("$.usage.output_tokens_by_modality", "text");
    let video = byModality("$.usage.output_tokens_by_modality", "video");
    if (video === 0) {
        const PER_SECOND: Record<string, number> = {
            "360p": 2106,
            "720p": 5792,
            "1080p": 8425,
            "4k": 16323,
        };
        const body = data.input.body;
        const d = body.response_format.duration;
        video = ((d === undefined ? 10 : Number(d.slice(0, -1))) +
            (body.generation_config.video_config.task === "extend" ? 10 : 0)) *
            (PER_SECOND[body.response_format.resolution] ?? 5792);
        logger.warn(
            "gemini interaction completed without video usage - billing the estimate",
        );
    }
    return {
        counts: {
            input_token: input,
            text_output_token: text + thought,
            video_output_token: video,
        },
    };
};

/**
 * Create the interaction in the background. An explicit `task` cannot be
 * combined with `previous_interaction_id` (Google: it forces a standalone
 * generation), so a chained edit or extension drops it.
 */
export const startOmni = async (
    { data, utils, logger }: {
        data: LifecycleStartData;
        utils: LifecycleUtils;
        logger: HookLogger;
    },
): Promise<LifecycleOutcome> => {
    const body = data.input.body as Record<string, unknown>;
    const config = body.generation_config as Record<string, unknown>;
    const wire = body.previous_interaction_id === undefined
        ? { ...body, background: true }
        : {
            ...body,
            background: true,
            generation_config: Object.fromEntries(
                Object.entries(config).filter(([k]) => k !== "video_config"),
            ),
        };
    const res = await utils.request({ body: wire as never });
    if (res.status < 200 || res.status >= 300) {
        return { kind: "COMPLETED", httpStatus: res.status, output: res.body };
    }
    const id = utils.json.optionalStr(res.body, "$.id");
    if (id === undefined) {
        throw Object.assign(
            new Error("Gemini interaction create returned no id"),
            { retriable: false },
        );
    }
    logger.debug("gemini interaction started", { id });
    return { kind: "RUNNING", state: { externalRunId: id } };
};

/**
 * Poll `GET /v1beta/interactions/{id}` until it settles. On completion the
 * last generated video block is lifted to `video` (with its Files API id
 * as `video.file` when delivered by uri), the handle for
 * `gemini#v1beta/files/{file}/download`.
 */
export const pollOmni = async (
    { data, utils, logger }: {
        data: LifecycleTickData;
        utils: LifecycleUtils;
        logger: HookLogger;
    },
): Promise<LifecycleOutcome> => {
    const id = data.lifecycle.state.externalRunId;
    if (id === undefined) {
        throw Object.assign(
            new Error("gemini poll without externalRunId in state"),
            { retriable: false },
        );
    }
    const res = await utils.http({
        method: "GET",
        path: "/v1beta/interactions/" + id,
    });
    if (res.status < 200 || res.status >= 300) {
        throw new Error(
            "Gemini interaction get returned " + String(res.status),
        );
    }
    const status = utils.json.optionalStr(res.body, "$.status");
    if (status === "in_progress" || status === "queued") {
        return { kind: "RUNNING", state: { externalRunId: id, stage: status } };
    }
    if (status !== "completed") {
        logger.warn("gemini interaction did not complete", {
            id,
            status: status ?? null,
        });
        return {
            kind: "COMPLETED",
            httpStatus: status === "cancelled" ? 409 : 500,
            providerHttpStatus: res.status,
            output: res.body,
        };
    }
    const steps = utils.json.optionalGet(res.body, "$.steps");
    let video: Record<string, unknown> | undefined;
    for (const step of Array.isArray(steps) ? steps : []) {
        if (
            step === null || typeof step !== "object" ||
            Array.isArray(step) || step.type !== "model_output" ||
            !Array.isArray(step.content)
        ) continue;
        for (const c of step.content) {
            if (
                c !== null && typeof c === "object" && !Array.isArray(c) &&
                c.type === "video"
            ) video = c;
        }
    }
    if (video === undefined) {
        logger.warn("gemini interaction completed without a video", { id });
        return {
            kind: "COMPLETED",
            httpStatus: 502,
            providerHttpStatus: res.status,
            output: res.body,
        };
    }
    const uri = typeof video.uri === "string" ? video.uri : "";
    const marker = "/files/";
    const at = uri.indexOf(marker);
    const file = at < 0
        ? undefined
        : uri.slice(at + marker.length).split(":")[0].split("?")[0];
    return {
        kind: "COMPLETED",
        httpStatus: 200,
        output: utils.json.merge(res.body, {
            video: {
                ...(uri !== "" ? { uri } : {}),
                ...(file !== undefined && file !== "" ? { file } : {}),
                ...(typeof video.mime_type === "string"
                    ? { mime_type: video.mime_type }
                    : {}),
            },
        }),
    };
};
