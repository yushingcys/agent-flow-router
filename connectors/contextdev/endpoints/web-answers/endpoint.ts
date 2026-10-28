import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAnswersBody } from "./schema/inputs.ts";

export default defineEndpoint({
    meta: {
        displayName: "Research Answer",
        summary:
            "Research a question on the web and get a sourced answer in your JSON shape.",
        description: "Give a research task and an example answer object; " +
            "an agent picks web searches, page reads, and company or " +
            "profile lookups, then returns json_content in your shape plus " +
            "the source URLs it read and cited. 'fast' suits short factual " +
            "tasks; 'ultra' (the default) researches deeper. Suited for " +
            "company facts, market questions, and enrichment fields no " +
            "single page holds.",
        docsUrl:
            "https://docs.context.dev/api-reference/web-extraction/answers",
        categories: ["web-search"],
        notes: [
            "mode 'fast' costs 10 credits; 'ultra', the default, costs 100.",
        ],
    },
    request: { method: "POST", path: "/web/answers" },
    // research runs up to the vendor's 300s deadline
    timeouts: { requestMs: 310_000, runMs: 310_000 },
    input: { schema: { body: zAnswersBody } },
    usage: {
        /** 10 credits for `fast`, 100 for `ultra` (the default), on
         *  success - https://docs.context.dev/account/credits (2026-10-27).
         *  The mode SELECTS one line (a counting rule, design D19): the
         *  request's mode, absent read as the vendor's default. */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                fast: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "fast answers",
                    consumes: { credit: "default", amount: 10 },
                },
                ultra: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "ultra answers",
                    consumes: { credit: "default", amount: 100 },
                },
            },
        },
        estimate: ({ data }) => ({
            counts: {
                fast: data.input.body.mode === "fast" ? 1 : 0,
                ultra: data.input.body.mode === "fast" ? 0 : 1,
            },
        }),
        evidence: ({ data, utils }) => {
            const fast =
                utils.json.optionalGet(data.input.body ?? {}, "$.mode") ===
                    "fast";
            return { counts: { fast: fast ? 1 : 0, ultra: fast ? 0 : 1 } };
        },
    },
});
