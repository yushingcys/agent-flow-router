import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCompanyPathParams } from "../../schema/common.ts";

/** GET /v1/company/enrichment/peers/{company} - curated peer set. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company Peers",
        summary: "A company's curated peers, competitors, and incumbents.",
        description: "Fetch the curated peer set for a company: each peer's " +
            "name, Akta uuid (pass it to the enrichment endpoints), " +
            "description, and peer type (direct_peer, broad_incumbent, " +
            "emerging_player).",
        docsUrl: "https://agent-docs.akta.pro/api-reference/company-data-peers",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/company/enrichment/peers/{company}" },
    input: { schema: { pathParams: zCompanyPathParams } },
    usage: {
        /** Flat 0.5 credits per call (agent-tier pricing table). */
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 0.5 },
        },
    },
});
