import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zTransactionIdentifierQueryParams } from "./schema/inputs.ts";

export default defineEndpoint({
    meta: {
        displayName: "Identify Transaction",
        summary:
            "Map a noisy card or bank descriptor to the real merchant and its brand data.",
        description: "Turn a raw card or bank statement descriptor into a " +
            "structured company profile: the resolved merchant name and " +
            "domain plus logos, colors, socials, address, and industry " +
            "classification - the enrichment behind clean transaction " +
            "feeds in banking, budgeting, and expense products. Optional " +
            "signals (city, country, MCC, phone) sharpen the match, and " +
            "high_confidence_only adds a verification pass so an ambiguous " +
            "descriptor returns nothing rather than a wrong merchant.",
        docsUrl: "https://docs.context.dev/guides/enrich-transaction-codes",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/brand/transaction_identifier" },
    input: { schema: { queryParams: zTransactionIdentifierQueryParams } },
    // a cold merchant resolves like a cold brand/retrieve (v1's budget)
    timeouts: { requestMs: 310_000, runMs: 310_000 },
    usage: {
        /** 10 credits per lookup, the Brand rate -
         *  https://docs.context.dev/account/credits (2026-10-27). Flat
         *  model, compiler-synthesized estimate/evidence; the provider
         *  consolidate lifts `key_metadata.credits_consumed`. */
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "transaction lookups",
            consumes: { credit: "default", amount: 10 },
        },
    },
});
