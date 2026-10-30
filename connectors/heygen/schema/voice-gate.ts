import type {
    LifecycleOutcome,
    LifecycleStartData,
    LifecycleUtils,
} from "@shared/core";

/**
 * The SHARED voice gate for every endpoint that names a voice it does not
 * delete (/voices/get, /text-to-speech, the Turbo Free promo,
 * /speech-to-speech). One closed-term value, so the compiler interns ONE
 * fnTable entry.
 *
 * The pooled HeyGen workspace can speak every tenant's clone, so the run
 * proceeds only for a voice this caller OWNS (the ownership window) or a
 * HeyGen PUBLIC voice (found in `GET /v3/models/audio/voices?type=public`).
 * Anything else is the vendor-shaped 404, upstream untouched. Then the
 * endpoint's own compiled request is relayed unchanged.
 */
export const voiceGateStart = async (
    { data, utils }: { data: LifecycleStartData; utils: LifecycleUtils },
): Promise<LifecycleOutcome> => {
    const $ = utils.json;
    const voiceId = $.optionalStr(data.input, "$.body.voice_id") ??
        $.optionalStr(data.input, "$.pathParams.voice_id") ?? "";
    const owned = await utils.resources.owned({
        resource: "heygen/voice",
        externalId: voiceId,
    });
    let allowed = owned.length > 0;
    let token = "";
    // ponytail: linear scan of the public catalog (10 pages x 100), cache it
    // host-side if the catalog outgrows that
    for (let page = 0; !allowed && voiceId !== "" && page < 10; page++) {
        const res = await utils.http({
            method: "GET",
            path: "/v3/models/audio/voices",
            queryParams: token === ""
                ? { type: "public", limit: "100" }
                : { type: "public", limit: "100", token },
        });
        if (res.status < 200 || res.status >= 300) {
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        }
        const voices = $.optionalGet(res.body, "$.data");
        allowed = Array.isArray(voices) &&
            voices.some((v) =>
                v !== null && typeof v === "object" && !Array.isArray(v) &&
                v.voice_id === voiceId
            );
        const next = $.optionalGet(res.body, "$.next_token");
        if ($.optionalGet(res.body, "$.has_more") !== true) break;
        if (typeof next !== "string" || next === "") break;
        token = next;
    }
    if (!allowed) {
        return {
            kind: "COMPLETED",
            httpStatus: 404,
            output: {
                error: {
                    code: "voice_not_found",
                    message: "Voice " + voiceId + " is not a HeyGen public " +
                        "voice or a voice this workspace cloned.",
                },
            },
        };
    }
    const res = await utils.request();
    return { kind: "COMPLETED", httpStatus: res.status, output: res.body };
};
