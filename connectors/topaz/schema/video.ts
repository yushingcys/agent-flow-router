import { z } from "zod";
import type {
    EstimateData,
    FnUsage,
    HookLogger,
    LifecycleOutcome,
    LifecycleTickData,
    LifecycleUtils,
} from "@shared/core";

/**
 * The Topaz VIDEO API (`POST https://api.topazlabs.com/video/`), shared by
 * every `topaz#video/*` endpoint: the request body, the create/accept/poll
 * lifecycle, and the pre-run estimate. Read from the vendor OpenAPI
 * (reference/video/*) and model pages, 2026-10-27.
 *
 * Why the full create and not `/video/express`: the create request carries
 * the source's duration and frame count, which is what the job is priced
 * on, so the hold can be computed before the run. Topaz re-checks those
 * values against the fetched file and fails the request with a full refund
 * if they are far off. Each endpoint narrows `filters` to one model family
 * (Topaz accepts a chain; one tool per endpoint here).
 */

const zSide = (what: string) =>
    z.number().int().min(1).describe(`${what} in pixels.`);

export const zSource = z.object({
    container: z
        .enum([
            "3gp",
            "avi",
            "dv",
            "flv",
            "m1v",
            "m2t",
            "m2ts",
            "m2v",
            "m4v",
            "mkv",
            "mov",
            "mp4",
            "mpeg",
            "mpg",
            "mts",
            "mxf",
            "ser",
            "ts",
            "vob",
            "webm",
            "wmv",
        ])
        .describe("Container format of the source file."),
    size: z
        .number()
        .int()
        .min(1)
        .max(99_999_999_999)
        .describe("Size of the source file in bytes (under 100 GB)."),
    duration: z
        .number()
        .positive()
        .describe("Duration of the source in seconds."),
    frameCount: z
        .number()
        .int()
        .min(1)
        .describe(
            "Total number of frames in the source. Prices the job (output " +
                "frames at the output resolution).",
        ),
    frameRate: z.number().positive().describe("Frame rate of the source."),
    resolution: z.object({
        width: zSide("Source width"),
        height: zSide("Source height"),
    }).strict(),
    // The source must come from a URL: uploading bytes to Topaz's presigned
    // parts is not something a run can do. The AWS AssumeRole variant of
    // ExternalStorage is left out.
    external: z.object({
        provider: z
            .literal("s3")
            .describe('Storage provider; Topaz accepts only "s3".'),
        presignedUrl: z
            .string()
            .regex(/^https:\/\/\S+$/, "must be an https:// URL")
            .describe(
                "https:// URL Topaz downloads the source video from (a " +
                    "presigned or public URL). Topaz fetches it when the " +
                    "request is created; an unreachable URL is a 400.",
            ),
    }).strict(),
}).strict();

export const zOutput = z.object({
    resolution: z.object({
        width: zSide("Output width"),
        height: zSide("Output height"),
    }).strict().describe(
        "Output resolution, rounded up to a multiple of 4. Forced to the " +
            "source resolution when the model does not upscale. Prices the " +
            "job.",
    ),
    frameRate: z
        .number()
        .positive()
        .describe(
            "Output frame rate. Forced to the source frame rate unless the " +
                "model interpolates frames.",
        ),
    audioTransfer: z
        .enum(["Copy", "Convert", "None"])
        .describe(
            "Copy: keep the source audio. Convert: re-encode it (set " +
                "audioCodec). None: drop it.",
        ),
    audioCodec: z
        .enum(["AAC", "AC3", "PCM"])
        .describe("Audio codec; required unless audioTransfer is None.")
        .optional(),
    audioBitrate: z
        .string()
        .describe("Audio bitrate for Copy/Convert; codec default if unset.")
        .optional(),
    videoEncoder: z
        .enum(["AV1", "H264", "H265", "ProRes", "VP9"])
        .describe(
            "Video encoder. Topaz defaults to H265. ProRes forces mov; AV1 " +
                "and VP9 force mp4; VP9 requires videoBitrate.",
        )
        .optional(),
    videoProfile: z
        .string()
        .describe(
            "Encoder profile: AV1 8-bit|10-bit, H264 High, H265 Main|Main10, " +
                "ProRes 422 Proxy|422 LT|422 Std|422 HQ, VP9 Good|Best.",
        )
        .optional(),
    videoBitrate: z
        .string()
        .regex(/^\d+(\.\d+)?[km]$/, 'a number suffixed "k" or "m"')
        .describe(
            'Constant bitrate such as "20m". Mutually exclusive with ' +
                "dynamicCompressionLevel.",
        )
        .optional(),
    dynamicCompressionLevel: z
        .enum(["Low", "Mid", "High"])
        .describe(
            "Automatic quality level (AV1/H264/H265). Topaz defaults to High " +
                "when no videoBitrate is set.",
        )
        .optional(),
    cropToFit: z
        .boolean()
        .describe("Center-crop to fit the output dimensions.")
        .optional(),
    container: z
        .enum(["mp4", "mov", "mkv", "avi", "webm"])
        .describe("Output container. Topaz defaults to mp4.")
        .optional(),
}).strict();

/** The create-request body around one endpoint's filter. */
export function videoBody<F extends z.ZodType>(filter: F) {
    return z.object({
        source: zSource,
        filters: z
            .array(filter)
            .min(1)
            .max(1)
            .describe("The one enhancement filter this tool applies."),
        output: zOutput,
    }).strict();
}

/** The enhancement knobs Topaz's precision families (Proteus, Artemis,
 *  Dione, Gaia, Iris) share. Omitted knobs are estimated automatically. */
export const zEnhanceKnobs = {
    auto: z
        .enum(["Auto", "Manual", "Relative"])
        .describe(
            "Parameter mode: Auto estimates every knob, Relative adds the " +
                "given knobs as weights on top, Manual uses them as set.",
        )
        .optional(),
    videoType: z
        .enum(["Progressive", "Interlaced", "ProgressiveInterlaced"])
        .describe("Frame/field type of the source.")
        .optional(),
    fieldOrder: z
        .enum(["TopFirst", "BottomFirst", "Auto"])
        .describe("Field order of an interlaced source.")
        .optional(),
    focusFixLevel: z
        .enum(["None", "Normal", "Strong"])
        .describe("Downscale the input first to correct blurred subjects.")
        .optional(),
    compression: z.number().min(-1).max(1)
        .describe("Compression recovery strength (-1 to 1).").optional(),
    details: z.number().min(-1).max(1)
        .describe("Detail reconstruction (-1 to 1).").optional(),
    prenoise: z.number().min(0).max(0.1)
        .describe("Noise added to the input to avoid over-smoothing.")
        .optional(),
    noise: z.number().min(-1).max(1)
        .describe("Noise reduction (-1 to 1).").optional(),
    halo: z.number().min(-1).max(1)
        .describe("Halo reduction (-1 to 1).").optional(),
    preblur: z.number().min(-1).max(1)
        .describe("Anti-aliasing and deblurring strength (-1 to 1).")
        .optional(),
    blur: z.number().min(-1).max(1)
        .describe("Sharpness applied (-1 to 1).").optional(),
    grain: z.number().min(0).max(0.1)
        .describe("Grain added after processing (0 to 0.1).").optional(),
    grainSize: z.number().min(0).max(5)
        .describe("Size of the added grain (0 to 5).").optional(),
    recoverOriginalDetailValue: z.number().min(0).max(1)
        .describe("Reintroduce source detail into the output (0 to 1).")
        .optional(),
};

/** Create the request (free: a quote), then accept it, which reserves the
 *  credits and starts processing from the external source. */
export const startVideo = async (
    { utils, logger }: { utils: LifecycleUtils; logger: HookLogger },
): Promise<LifecycleOutcome> => {
    const res = await utils.request();
    if (res.status < 200 || res.status >= 300) {
        // rejected at create (bad input, unreachable source): DATA
        return { kind: "COMPLETED", httpStatus: res.status, output: res.body };
    }
    const requestId = utils.json.optionalStr(res.body, "$.requestId");
    if (requestId === undefined || requestId === "") {
        throw Object.assign(
            new Error("Topaz video create returned no requestId"),
            { retriable: false },
        );
    }
    const accept = await utils.http({
        method: "PATCH",
        path: "/video/" + requestId + "/accept",
    });
    if (accept.status < 200 || accept.status >= 300) {
        // nothing was reserved (402 out of credits, ...): DATA. Not thrown:
        // a retried start would create and accept a second request.
        logger.warn("topaz video accept rejected", {
            requestId,
            status: accept.status,
        });
        return {
            kind: "COMPLETED",
            httpStatus: accept.status,
            output: accept.body,
        };
    }
    logger.debug("topaz video request accepted", { requestId });
    return {
        kind: "RUNNING",
        state: { externalRunId: requestId, stage: "accepted" },
    };
};

/** Poll `/video/{id}/status`. A failed GET throws (retriable): the job is
 *  still processing, and billing, upstream. */
export const pollVideo = async (
    { data, utils, logger }: {
        data: LifecycleTickData;
        utils: LifecycleUtils;
        logger: HookLogger;
    },
): Promise<LifecycleOutcome> => {
    const requestId = data.lifecycle.state.externalRunId;
    if (requestId === undefined) {
        throw Object.assign(
            new Error("topaz video poll without externalRunId in state"),
            { retriable: false },
        );
    }
    const res = await utils.http({
        method: "GET",
        path: "/video/" + requestId + "/status",
    });
    if (res.status < 200 || res.status >= 300) {
        throw new Error("Topaz video status returned " + String(res.status));
    }
    const output = utils.json.merge(res.body, { requestId });
    const status = utils.json.optionalStr(res.body, "$.status");
    if (status === "failed" || status === "canceled") {
        // failed requests are refunded by Topaz
        logger.warn("topaz video request did not complete", {
            requestId,
            status,
        });
        return {
            kind: "COMPLETED",
            httpStatus: status === "canceled" ? 409 : 500,
            providerHttpStatus: res.status,
            output,
        };
    }
    if (status !== "complete") {
        return {
            kind: "RUNNING",
            state: {
                externalRunId: requestId,
                ...(status !== undefined ? { stage: status } : {}),
            },
        };
    }
    const url = utils.json.optionalStr(res.body, "$.download.url");
    if (url === undefined || url === "") {
        logger.warn("topaz video completed without a download url", {
            requestId,
        });
        return {
            kind: "COMPLETED",
            httpStatus: 502,
            providerHttpStatus: res.status,
            output,
        };
    }
    return {
        kind: "COMPLETED",
        httpStatus: 200,
        providerHttpStatus: res.status,
        output,
    };
};

/**
 * The pre-run hold: output frames / the model's frames-per-credit at the
 * output resolution. Rates are Topaz's published frames per credit at
 * 1080p and 4K (model pages, 2026-10-27; where a family publishes a
 * duration table instead, its 10-minute 30 fps row converted to frames).
 * ponytail: two resolution tiers only (up to 1080p, above it the 4K rate,
 * scaled up for outputs larger than 4K), the way Topaz's own tables are
 * laid out; the run settles on the credits Topaz reports, so the tiers
 * only shape the hold. Interpolation models multiply frames by slow motion
 * and the output frame rate.
 */
export const estimateVideo = (
    { data }: {
        data: Omit<EstimateData, "input"> & {
            input: {
                body: {
                    source: {
                        duration: number;
                        frameCount: number;
                        frameRate: number;
                    };
                    filters: {
                        model: string;
                        slowmo?: number;
                        fps?: number;
                    }[];
                    output: {
                        resolution: { width: number; height: number };
                        frameRate: number;
                    };
                };
            };
        };
    },
): FnUsage => {
    // [frames per credit up to 1080p, at 4K]
    const PROTEUS = [237, 59.6];
    const FRAMES_PER_CREDIT: Record<string, number[]> = {
        "prob-4": PROTEUS,
        "pnat-1": PROTEUS,
        "rhea-1": PROTEUS,
        "thd-3": PROTEUS,
        "thf-4": PROTEUS,
        "aaa-9": PROTEUS,
        "aaa-10": PROTEUS,
        "ahq-12": PROTEUS,
        "alq-13": PROTEUS,
        "alqs-2": PROTEUS,
        "amq-13": PROTEUS,
        "amqs-2": PROTEUS,
        "ddv-3": PROTEUS,
        "dtd-4": PROTEUS,
        "dtds-2": PROTEUS,
        "dtv-4": PROTEUS,
        "dtvs-2": PROTEUS,
        "gcg-5": PROTEUS,
        "ghq-5": PROTEUS,
        "ganim-1": [300, 100],
        "iris-2": PROTEUS,
        "iris-3": PROTEUS,
        "nyx-3": [518, 129],
        "nxf-1": [474, 119],
        "nxl-1": PROTEUS,
        "nxhf-1": PROTEUS,
        "thm-2": [518, 129],
        "color-1": [518, 129],
        "hyp-1": PROTEUS,
        "hyp-2": [13, 6],
        "hyp-2.5": [13.02, 5.96],
        "apo-8": [252, 64],
        "apf-2": [252, 64],
        "chr-2": [252, 64],
        "chf-3": [252, 64],
        "aion-1": [85.7, 21.4],
        "slp-2.6": [26.04, 11.92],
        "slf-3": [26.04, 11.92],
        "slf-2": [52.08, 23.84],
        "slhq-1": [26.04, 11.92],
        "slm-1": [26.04, 11.92],
        "ast-2": [10, 6],
    };
    const body = data.input.body;
    const filter = body.filters[0];
    const rates = FRAMES_PER_CREDIT[filter.model] ?? PROTEUS;
    const interpolates = ["apo-8", "apf-2", "chr-2", "chf-3", "aion-1"]
        .includes(filter.model);
    const frames = interpolates
        ? Math.ceil(
            body.source.duration * (filter.slowmo ?? 1) *
                Math.max(body.output.frameRate, filter.fps ?? 0),
        )
        : body.source.frameCount;
    const pixels = body.output.resolution.width *
        body.output.resolution.height;
    const perCredit = pixels <= 1920 * 1088
        ? rates[0]
        : rates[1] / Math.max(1, pixels / (3840 * 2160));
    return {
        counts: { CREDIT: Math.max(1, Math.ceil(frames / perCredit)) },
    };
};
