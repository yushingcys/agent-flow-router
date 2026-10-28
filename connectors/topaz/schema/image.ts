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
 * The Topaz IMAGE API (https://api.topazlabs.com/image/v1), shared by every
 * `topaz#image/*` endpoint: the zod fragments of its multipart form, the
 * submit/poll lifecycle, and the pre-run estimate. Authored once as
 * closed-term consts, so every endpoint links the same fnTable entries.
 *
 * Read from the vendor OpenAPI (reference/image/*) and model pages,
 * 2026-10-27. Only `source_url` is mirrored: the `image` file part cannot
 * travel through a JSON run input.
 */

export const zSourceUrl = z
    .string()
    .regex(/^https:\/\/\S+$/, "must be a public https:// URL")
    .describe(
        "Public https:// URL of the source image (JPEG, PNG or TIFF) that " +
            "Topaz fetches.",
    );

export const zOutputFormat = z
    .enum(["jpeg", "jpg", "png", "tiff", "tif"])
    .describe("Output image format. Topaz defaults to jpeg.");

export function zOutputSide(side: "width" | "height") {
    return z
        .number()
        .int()
        .min(1)
        .max(32000)
        .describe(
            `Output ${side} in pixels; the image is upscaled to it. With ` +
                "only one side set the other scales proportionally. Output " +
                "size prices the job.",
        );
}

export const zCropToFill = z
    .boolean()
    .describe(
        "When both output sides change the aspect ratio: true crops to " +
            "fill, false (Topaz's default) letterboxes.",
    );

/** Submit the job. The body is the vendor's multipart form. */
export const startImage = async (
    { utils, logger }: { utils: LifecycleUtils; logger: HookLogger },
): Promise<LifecycleOutcome> => {
    const res = await utils.request({ bodyEncoding: "multipart" });
    if (res.status < 200 || res.status >= 300) {
        // rejected before a job existed (bad input, 402 out of credits):
        // DATA, zero-billed
        return { kind: "COMPLETED", httpStatus: res.status, output: res.body };
    }
    const processId = utils.json.optionalStr(res.body, "$.process_id");
    if (processId === undefined || processId === "") {
        throw Object.assign(
            new Error("Topaz image submit returned no process_id"),
            { retriable: false },
        );
    }
    logger.debug("topaz image job submitted", { processId });
    return { kind: "RUNNING", state: { externalRunId: processId } };
};

/** Poll `/status/{id}`; once Completed, fetch the presigned link from
 *  `/download/{id}` and return the status with it under `download`. A
 *  failed GET throws (retriable): the job is still running upstream. */
export const pollImage = async (
    { data, utils, logger }: {
        data: LifecycleTickData;
        utils: LifecycleUtils;
        logger: HookLogger;
    },
): Promise<LifecycleOutcome> => {
    const processId = data.lifecycle.state.externalRunId;
    if (processId === undefined) {
        throw Object.assign(
            new Error("topaz image poll without externalRunId in state"),
            { retriable: false },
        );
    }
    const res = await utils.http({
        method: "GET",
        path: "/image/v1/status/" + processId,
    });
    if (res.status < 200 || res.status >= 300) {
        throw new Error("Topaz image status returned " + String(res.status));
    }
    const status = utils.json.optionalStr(res.body, "$.status");
    if (status === "Failed" || status === "Cancelled") {
        logger.warn("topaz image job did not complete", { processId, status });
        return {
            kind: "COMPLETED",
            httpStatus: status === "Cancelled" ? 409 : 500,
            providerHttpStatus: res.status,
            output: res.body,
        };
    }
    if (status !== "Completed") {
        // Pending | Processing, or a status we do not know: still in flight
        return {
            kind: "RUNNING",
            state: {
                externalRunId: processId,
                ...(status !== undefined ? { stage: status } : {}),
            },
        };
    }
    const dl = await utils.http({
        method: "GET",
        path: "/image/v1/download/" + processId,
    });
    if (dl.status < 200 || dl.status >= 300) {
        throw new Error("Topaz image download returned " + String(dl.status));
    }
    const output = utils.json.merge(res.body, { download: dl.body });
    const url = utils.json.optionalStr(dl.body, "$.download_url");
    if (url === undefined || url === "") {
        logger.warn("topaz image job completed without a download url", {
            processId,
        });
        return {
            kind: "COMPLETED",
            httpStatus: 502,
            providerHttpStatus: dl.status,
            output,
        };
    }
    return {
        kind: "COMPLETED",
        httpStatus: 200,
        providerHttpStatus: dl.status,
        output,
    };
};

/**
 * The pre-run hold. Topaz bills ceil(output megapixels / the model's
 * megapixels-per-credit), at least 1 (developer.topazlabs.com model family
 * pages, 2026-10-27). Output size is known only when the request sets it:
 * both sides give the exact figure; one side is held as a square of it.
 * ponytail: with no output size (or on tools that keep the input size) the
 * hold is 1 credit, exact up to the model's megapixels-per-credit (24 MP
 * for most tools); larger outputs settle above the hold at Topaz's own
 * figure. Reading the input size would need a fetch the estimate cannot do.
 */
export const estimateImage = (
    { data }: {
        data: Omit<EstimateData, "input"> & {
            input: {
                body: {
                    model: string;
                    output_width?: number;
                    output_height?: number;
                };
            };
        };
    },
): FnUsage => {
    const MP_PER_CREDIT: Record<string, number> = {
        "Bloom 2": 2,
        "Bloom": 2,
        "Reimagine": 2,
        "Bloom Realism": 2,
        "Wonder": 4,
        "Wonder 2": 4,
        "Wonder 3": 8,
        "Wonder 3.5": 8,
        "Standard MAX": 4,
        "Recovery V2": 4,
        "Recover 3": 4,
        "Redefine": 4,
        "Super Focus V2": 20,
        "Super Focus V3": 20,
        "Denoise Max": 20,
        "Relight Creative V1": 4,
    };
    const body = data.input.body;
    const rate = MP_PER_CREDIT[body.model] ?? 24;
    const w = body.output_width ?? body.output_height;
    const h = body.output_height ?? body.output_width;
    const mp = w !== undefined && h !== undefined ? (w * h) / 1e6 : rate;
    return { counts: { CREDIT: Math.max(1, Math.ceil(mp / rate)) } };
};
