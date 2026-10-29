import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zContextPathParams } from "./schema/inputs.ts";

/** GET /v2/companies/{domain}/context - AI business context. */
export default defineEndpoint({
    meta: {
        displayName: "Get company context",
        summary:
            "AI-generated business context for a company: model, market, differentiators.",
        description: "Retrieve an AI-generated context for a company, " +
            "synthesized from its website and other authoritative sources: " +
            "business model, target market, products, competitive " +
            "advantages and other strategic insights, with the company " +
            "record and the source pages it was built from.",
        docsUrl: "https://www.thecompaniesapi.com/api/fetch-company-context",
        notes: [
            "The vendor does not publish a fixed price for this call; the " +
            "response's meta.cost settles the bill (1 credit is the hold).",
        ],
    },
    endpoint: "/fetch_company_context",
    request: { method: "GET", path: "/v2/companies/{domain}/context" },
    input: { schema: { pathParams: zContextPathParams } },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "request",
            consumes: { credit: "default", amount: 1 },
        },
    },
});
