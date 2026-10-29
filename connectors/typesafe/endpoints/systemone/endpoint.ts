import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zSystemOneBody } from "./schema/inputs.ts";

/**
 * `POST /v1/systemone` - answer named questions about one state.
 *
 * Input tokens depend on Jev's tokenizer, so the estimate is a CEILING
 * deduced from the input: 3 tokens per UTF-16 code unit of the JSON-
 * encoded state and questions (a byte-level tokenizer emits at most one
 * token per UTF-8 byte, a code unit is at most 3 bytes). Real text runs
 * far below that; the vendor's `usage.input_tokens` settles.
 */
export default defineEndpoint({
    meta: {
        displayName: "Jev System One Evaluation",
        summary: "Evaluate typed questions against any state and get " +
            "calibrated structured judgments.",
        description: "Send a state (plain text or structured JSON) plus a " +
            "map of named questions and get typed answers back in one " +
            "sub-second call: `noul` answers a yes/no with a calibrated " +
            "probability, `choice` classifies into your own options with a " +
            "probability per option and confidence, `score` rates on your " +
            "own rubric of up to 10 levels with a probability-weighted value. Mix " +
            "question types freely; every question is evaluated in " +
            "parallel against the same state. Suited for triage and intent " +
            "routing, LLM guardrails, re-ranking, entity matching, and " +
            "claim verification.",
        docsUrl: "https://docs.typesafe.ai/api/system-one",
        notes: [
            "Text only: image assets and `box` questions are not exposed " +
            "(they need a per-request opt-in header).",
            "A request must fit 64k tokens for the state plus all questions " +
            "and 32k for the state plus any one question; longer requests " +
            "fail with 400 max_tokens_exceeded.",
            "Aliases move with new releases; pin a version such as " +
            "jev-1.14.0 if you tuned thresholds against it.",
        ],
    },
    endpoint: "/systemone",
    request: { method: "POST", path: "/v1/systemone" },
    input: { schema: { body: zSystemOneBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.TOKEN,
            label: "input tokens",
            consumes: { credit: "default", amount: 1 },
        },
        estimate: ({ data }) => {
            const body = data.input.body;
            const text = JSON.stringify({
                state: body.state,
                questions: body.questions,
            });
            return { counts: { TOKEN: 3 * text.length } };
        },
        evidence: ({ data, utils }) => ({
            counts: {
                TOKEN: utils.json.optionalNum(
                    data.output,
                    "$.usage.input_tokens",
                ) ?? 0,
            },
        }),
        /** The vendor's own claim (design D27): `usage.input_tokens` is
         *  the billable count. The `usage` receipt is lifted out of the
         *  output; entry OMITTED when absent (never `?? 0`). */
        consolidate: ({ data, utils }) => {
            const { value, rest } = utils.json.pluck(data.output, "$.usage");
            const tokens = utils.json.optionalNum(
                value ?? null,
                "$.input_tokens",
            );
            return {
                credits: {
                    ...(tokens !== undefined ? { default: tokens } : {}),
                },
                output: rest,
            };
        },
    },
});
