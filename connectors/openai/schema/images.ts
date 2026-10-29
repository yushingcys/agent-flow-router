import { z } from "zod";
import {
    type BinaryPart,
    type EstimateData,
    type FnUsage,
    type FnUtils,
    type HookLogger,
    type Json,
    type LifecycleOutcome,
    type LifecycleStartData,
    type LifecycleUtils,
    Unit,
    UsageModelKind,
    zBinaryPart,
} from "@shared/core";

/**
 * The OpenAI Images request fields shared by every `openai#v1/image/*`
 * endpoint, the pre-run estimate, and the edit upload. Mirrored from the
 * official SDK's generated params (openai-python `image_generate_params`,
 * `image_edit_params`, read 2026-10-29). Not mirrored: `stream` and
 * `partial_images` (server-sent events, not one JSON answer),
 * `response_format` and `style` (legacy, unsupported on GPT Image models),
 * `input_fidelity` (OpenAI says to omit it for gpt-image-2 and later), and
 * the deprecated `user` (`safety_identifier` replaces it).
 */

export const zQuality2 = z
    .enum(["low", "medium", "high", "auto"])
    .describe(
        "Render quality; higher costs more output tokens. auto (OpenAI's " +
            "default) picks the best quality for the prompt.",
    );

export const zQuality25 = z
    .enum(["low", "medium", "high", "xhigh", "max", "auto"])
    .describe(
        "Render quality; higher costs more output tokens (max is about 36x " +
            "low). auto (OpenAI's default) picks the best quality for the " +
            "prompt.",
    );

const zPrompt = z
    .string()
    .min(1)
    .max(32000)
    .describe("A text description of the desired image (up to 32000 chars).");

export const zImageFields = {
    prompt: zPrompt,
    size: z
        .string()
        .regex(/^(auto|\d+x\d+)$/, "WIDTHxHEIGHT or auto")
        .describe(
            "Output size as WIDTHxHEIGHT, e.g. 1024x1024, 1536x1024, " +
                "1024x1536 or 1536x864. Both sides multiples of 16, aspect " +
                "between 1:3 and 3:1, at most 3840x2160 (above 2560x1440 is " +
                "experimental). auto (the default) lets the model choose.",
        )
        .optional(),
    n: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Number of images to generate (1-10, default 1).")
        .optional(),
    background: z
        .enum(["transparent", "opaque", "auto"])
        .describe(
            "Background transparency (default auto). transparent needs " +
                "output_format png or webp; preview on gpt-image-2.",
        )
        .optional(),
    output_format: z
        .enum(["png", "jpeg", "webp"])
        .describe("Encoding of the returned image (default png).")
        .optional(),
    output_compression: z
        .number()
        .int()
        .min(0)
        .max(100)
        .describe("Compression level 0-100 for jpeg and webp (default 100).")
        .optional(),
    moderation: z
        .enum(["low", "auto"])
        .describe(
            "Content-moderation strictness: auto (default) or low for less " +
                "restrictive filtering.",
        )
        .optional(),
    safety_identifier: z
        .string()
        .describe(
            "A stable hashed id for your end user, for OpenAI's abuse " +
                "monitoring.",
        )
        .optional(),
};

/** The per-token rate card shared by every endpoint (see provider.ts). */
export const tokenModel = {
    kind: UsageModelKind.COMPOSITE,
    components: {
        text_input_token: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            consumes: { credit: "default", amount: 5 / 1e6 },
            label: "text input",
            description: "$5 per 1M text input tokens",
        },
        image_input_token: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            consumes: { credit: "default", amount: 8 / 1e6 },
            label: "image input",
            description: "$8 per 1M image input tokens",
        },
        image_output_token: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            consumes: { credit: "default", amount: 30 / 1e6 },
            label: "image output",
            description: "$30 per 1M image output tokens",
        },
    },
} as const;

/** An input image: a public https:// URL fetched before upload, or the
 *  file itself as `{base64, contentType, filename?}`. */
const zImageSource = z.union([
    z
        .string()
        .regex(/^https:\/\/\S+$/, "must be a public https:// URL")
        .describe("Public https:// URL of a png, webp or jpg under 50 MB."),
    zBinaryPart,
]);

export const zEditFields = {
    ...zImageFields,
    image: z
        .array(zImageSource)
        .min(1)
        .max(16)
        .describe(
            "1-16 images to edit or compose from (png, webp or jpg, each " +
                "under 50 MB): public https:// URLs, or files as " +
                "{base64, contentType, filename?}.",
        ),
    mask: zImageSource
        .describe(
            "A PNG the same size as the first image whose fully " +
                "transparent pixels mark where to edit (under 4 MB).",
        )
        .optional(),
};

/**
 * The pre-run hold: output image tokens per image at 1024x1024 by quality
 * (OpenAI's published per-image examples at $30 / 1M: GPT Image 2.5 low
 * 196 ... max 7024; gpt-image-2 low/medium/high are the 2.5 low/high/max
 * budgets), scaled by pixel area and n, plus the prompt at ~4 chars per
 * token. ponytail: `auto` is held as high, and input image tokens on
 * edits are not held (their count is unknowable before upload); both
 * settle on the reported usage.
 */
export const estimateImage = (
    { data }: {
        data: Omit<EstimateData, "input"> & {
            input: {
                body: {
                    model: string;
                    prompt: string;
                    quality?: string;
                    size?: string;
                    n?: number;
                };
            };
        };
    },
): FnUsage => {
    const body = data.input.body;
    const PER_MEGAPIXEL: Record<string, number> = body.model.startsWith(
            "gpt-image-2.5",
        )
        ? { low: 196, medium: 439, high: 1756, xhigh: 3122, max: 7024 }
        : { low: 196, medium: 1756, high: 7024 };
    const perImage = PER_MEGAPIXEL[body.quality ?? "auto"] ??
        PER_MEGAPIXEL.high;
    const dims = (body.size ?? "auto").split("x").map((s) => Number(s));
    const area = dims.length === 2 ? dims[0] * dims[1] : 1024 * 1024;
    return {
        counts: {
            text_input_token: Math.ceil(body.prompt.length / 4),
            image_input_token: 0,
            image_output_token: Math.ceil(
                perImage * (area / (1024 * 1024)) * (body.n ?? 1),
            ),
        },
    };
};

/** Settle on `usage`, on every GPT Image response. Output tokens are all
 *  image tokens (text output is not billed); a response without
 *  `output_tokens_details` reports them as `output_tokens`. */
export const evidenceImage = (
    { data, utils, logger }: {
        data: { output: Json };
        utils: FnUtils;
        logger: HookLogger;
    },
): FnUsage => {
    const text = utils.json.optionalNum(
        data.output,
        "$.usage.input_tokens_details.text_tokens",
    );
    const image = utils.json.optionalNum(
        data.output,
        "$.usage.input_tokens_details.image_tokens",
    );
    const out = utils.json.optionalNum(
        data.output,
        "$.usage.output_tokens_details.image_tokens",
    ) ?? utils.json.optionalNum(data.output, "$.usage.output_tokens");
    if (out === undefined) {
        logger.warn("openai image response without usage - zero-billing");
    }
    return {
        counts: {
            text_input_token: text ?? 0,
            image_input_token: image ?? 0,
            image_output_token: out ?? 0,
        },
    };
};

/**
 * `/v1/images/edits` takes the images as multipart file parts. URL
 * sources are fetched first (bare, no credential) and uploaded as files;
 * a source that does not answer with an image fails the run unbilled
 * before OpenAI is called.
 */
export const startEdit = async (
    { data, utils, logger }: {
        data: LifecycleStartData;
        utils: LifecycleUtils;
        logger: HookLogger;
    },
): Promise<LifecycleOutcome> => {
    const body = data.input.body as Record<string, unknown>;
    const sources = (body.image as unknown[]).concat(
        body.mask === undefined ? [] : [body.mask],
    );
    const parts: BinaryPart[] = [];
    for (const [i, src] of sources.entries()) {
        let part = src as BinaryPart;
        if (typeof src === "string") {
            const res = await utils.http({ method: "GET", url: src });
            const got = res.body as Record<string, unknown> | null;
            const type = got !== null && typeof got === "object"
                ? got.contentType
                : undefined;
            if (
                res.status < 200 || res.status >= 300 ||
                typeof type !== "string" || !type.startsWith("image/") ||
                typeof got?.base64 !== "string"
            ) {
                logger.warn("openai edit source is not an image", {
                    url: src,
                    status: res.status,
                });
                return {
                    kind: "COMPLETED",
                    httpStatus: 400,
                    providerHttpStatus: res.status,
                    output: {
                        error: {
                            message: "Could not fetch an image from " + src +
                                " (HTTP " + String(res.status) + ")",
                            type: "invalid_request_error",
                            code: "image_fetch_failed",
                        },
                    },
                };
            }
            part = { base64: got.base64, contentType: type };
        }
        const ext = (part.contentType ?? "image/png").split("/")[1] ?? "png";
        parts.push({
            ...part,
            filename: part.filename ??
                (i < (body.image as unknown[]).length ? "image-" + i : "mask") +
                    "." + (ext === "jpeg" ? "jpg" : ext),
        });
    }
    const images = parts.slice(0, (body.image as unknown[]).length);
    const form: Record<string, unknown> = { ...body };
    delete form.image;
    delete form.mask;
    const res = await utils.request({
        bodyEncoding: "multipart",
        body: {
            ...(form as Record<string, string | number>),
            ...(images.length === 1
                ? { image: images[0] }
                : { "image[]": images }),
            ...(body.mask === undefined ? {} : { mask: parts[images.length] }),
        },
    });
    return { kind: "COMPLETED", httpStatus: res.status, output: res.body };
};
