import { defineProvider, presets } from "@shared/core";

/**
 * TypeSafe (typesafe.ai) - Jev, a System One decision model. One
 * synchronous JSON endpoint, `POST https://api.typesafe.ai/v1/systemone`,
 * Bearer auth (api.typesafe.ai/openapi.json v0.2.0, read 2026-10-29).
 * Monid lists it as `/systemone`, so the id keeps that path and the wire
 * path rides in `request.path` (design D22).
 *
 * BILLING. TypeSafe bills input tokens only - $0.042 per million on every
 * current model and alias; output tokens are free
 * (docs.typesafe.ai/models, read 2026-10-29). Every response reports
 * `usage.input_tokens` (the billable count) and `usage.output_tokens`.
 * One pool of input tokens; the vendor's count settles. Errors are vendor
 * non-2xx and bill nothing.
 */
export default defineProvider({
    name: "typesafe",
    meta: {
        displayName: "TypeSafe",
        summary: "Calibrated yes/no, choice, and score judgments your code " +
            "can branch on.",
        description: "TypeSafe Jev, a System One decision model: send any " +
            "state (text or structured JSON) plus typed questions and get " +
            "calibrated judgments back in one sub-second call - classify " +
            "into your own options, score on your own rubric, or verify " +
            "yes/no claims, each with probabilities and confidence. Batch " +
            "many questions against one state in a single request.",
        homepageUrl: "https://typesafe.ai",
        docsUrl: "https://docs.typesafe.ai/api",
        categories: ["decision-models"],
        notes: [
            "Billed per input token (state plus questions); output tokens " +
            "are free, and failed requests bill nothing.",
            "Rate limits are per organization in tokens and requests per " +
            "second; over either returns 429, and 529 means TypeSafe is " +
            "overloaded - retry with backoff.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.typesafe.ai" },
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    usage: {
        credits: {
            default: {
                label: "TypeSafe input tokens",
                description: "billable input tokens; output tokens are free",
            },
        },
    },
    output: {
        /** 400 answers `{detail: string | object}`, 422 answers
         *  `{detail: [{loc, msg, type}]}` (OpenAPI HTTPBadRequestError /
         *  HTTPValidationError). */
        fromError: ({ data, utils }) => {
            const detail = utils.json.optionalGet(data.output, "$.detail");
            const first = Array.isArray(detail)
                ? utils.json.optionalGet(data.output, "$.detail[0].msg")
                : undefined;
            return {
                message: typeof detail === "string" && detail !== ""
                    ? detail
                    : typeof first === "string" && first !== ""
                    ? first
                    : "TypeSafe API error",
                raw: data.output,
            };
        },
    },
});
