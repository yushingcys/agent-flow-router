import { z } from "zod";
import type {
    HookLogger,
    LifecycleOutcome,
    LifecycleStartData,
    LifecycleTickData,
    LifecycleUtils,
} from "@shared/core";

/**
 * HeyGen Video (`heygen-video-1`) - the shared request fragments and the
 * shared async lifecycle of the three video endpoints (docs/models/
 * heygen-video, read 2026-10-29). Each endpoint's body IS HeyGen's wire
 * shape for its `mode`, with `model` and `mode` pinned by literal
 * defaults, so `start` relays the validated body unchanged.
 */

export const zPrompt = z.string().min(1).max(32000).describe(
    "What to generate, 1-32,000 characters; long, specific prompts work " +
        "best. Name the camera, the light and the sound; spoken lines in " +
        "double quotes are voiced (about 2.5 words per second).",
);

export const zResolution = z.enum(["480p", "768p", "1080p", "2k"]).describe(
    "Output size class; selects the per-second rate. HeyGen defaults to " +
        "768p. 1080p and 2k render only 16:9 or 9:16.",
);

export const zPromptEnhancement = z
    .enum(["turbo", "quality", "ultraquality", "disabled"])
    .describe(
        "How the prompt is expanded before generation: turbo fastest, " +
            "quality (HeyGen's default) balanced, ultraquality slowest, " +
            "disabled sends the prompt as written.",
    );

export const zSeed = z.number().int().min(0).max(4294967295).describe(
    "Fix it to make a shot repeatable and iterate one clause at a time. " +
        "Random when omitted.",
);

export const zAspectRatio = z
    .enum(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"])
    .describe("Output shape. HeyGen defaults to 16:9 for text-to-video.");

/**
 * START: `POST /v3/models/videos` with a run-stable Idempotency-Key, so a
 * retried activity converges on one job. Non-2xx is DATA (nothing was
 * charged); a 2xx without a video_id is a deterministic contract breach.
 */
export const videoStart = async (
    { data, utils }: { data: LifecycleStartData; utils: LifecycleUtils },
): Promise<LifecycleOutcome> => {
    const res = await utils.http({
        method: "POST",
        path: "/v3/models/videos",
        headers: { "Idempotency-Key": data.run.runId + ":video" },
        body: data.input.body ?? {},
    });
    if (res.status < 200 || res.status >= 300) {
        return { kind: "COMPLETED", httpStatus: res.status, output: res.body };
    }
    const videoId = utils.json.optionalStr(res.body, "$.data.video_id");
    if (videoId === undefined || videoId === "") {
        throw Object.assign(
            new Error("HeyGen video submit returned no video_id"),
            { retriable: false },
        );
    }
    return { kind: "RUNNING", state: { externalRunId: videoId } };
};

/**
 * POLL: `GET /v3/models/videos/{video_id}`. A non-2xx on OUR read throws
 * (retriable): the job runs to completion and bills either way, so a blip
 * must not abandon it. `failed` / `cancelled` settle as a synthesized 500
 * (zero-billed); `completed` without a video_url as 502. Anything else is
 * still in flight; `runMs` bounds it. The output is the job record.
 */
export const videoPoll = async (
    { data, utils, logger }: {
        data: LifecycleTickData;
        utils: LifecycleUtils;
        logger: HookLogger;
    },
): Promise<LifecycleOutcome> => {
    const videoId = data.lifecycle.state.externalRunId;
    if (videoId === undefined) {
        throw Object.assign(
            new Error("heygen video poll without externalRunId in state"),
            { retriable: false },
        );
    }
    const res = await utils.http({
        method: "GET",
        path: "/v3/models/videos/" + encodeURIComponent(videoId),
    });
    if (res.status < 200 || res.status >= 300) {
        throw new Error("HeyGen video read returned " + String(res.status));
    }
    const job = utils.json.optionalGet(res.body, "$.data") ?? res.body;
    const status = utils.json.optionalStr(job, "$.status");
    if (status === "failed" || status === "cancelled") {
        logger.warn("heygen video ended without a clip", { videoId, status });
        return {
            kind: "COMPLETED",
            httpStatus: 500,
            providerHttpStatus: res.status,
            output: job,
        };
    }
    if (status !== "completed") {
        return {
            kind: "RUNNING",
            state: {
                externalRunId: videoId,
                ...(status !== undefined ? { stage: status } : {}),
            },
        };
    }
    const url = utils.json.optionalStr(job, "$.video_url");
    if (url === undefined || url === "") {
        logger.warn("heygen video completed without a video_url", {
            videoId,
        });
        return {
            kind: "COMPLETED",
            httpStatus: 502,
            providerHttpStatus: res.status,
            output: job,
        };
    }
    return {
        kind: "COMPLETED",
        httpStatus: 200,
        providerHttpStatus: res.status,
        output: job,
    };
};
