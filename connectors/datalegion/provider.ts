import { defineProvider, presets } from "@shared/core";

/**
 * Data Legion (datalegion.ai) - person and company enrichment. Two wire
 * endpoints, `POST /person/enrich` and `POST /company/enrich`, on
 * `https://api.datalegion.ai`, authenticated by an `API-Key` header.
 *
 * PRODUCTS, NOT PATHS. Data Legion sells self-serve credits as six
 * products (docs getting-started/self-serve-products): Person Base / Base
 * with Contact Data / Premium / Premium with Contact Data, and Company
 * Base / Premium. The product is an ACCOUNT fact - an account holds one
 * person product and one company product, and a response carries only
 * the fields that product covers. Monid lists the six products as six
 * paths; each doc here keeps Monid's path as its `endpoint` id and sends
 * the vendor's one shared wire path (design D22, the contactout twins).
 *
 * BILLING: "every record the API returns costs one credit of that
 * product. A lookup with no match costs nothing" - a no-match is a 404,
 * which the engine zero-bills. One credit POOL per product, each endpoint
 * draining its own. The vendor reports the draw only in the
 * `Credits-Used` response header, which hook fns cannot read, so there is
 * no `usage.consolidate`: the derived fold (records in `matches[]`)
 * settles.
 */
export default defineProvider({
    name: "datalegion",
    meta: {
        displayName: "Data Legion",
        summary: "Person and company enrichment from identifiers.",
        description: "Data Legion person and company enrichment: match a " +
            "person by email, phone, social URL, LinkedIn ID, email hash or " +
            "name plus context (188M+ profiles, 100+ fields), or a company " +
            "by domain, name, LinkedIn ID, social URL or ticker (71M+ " +
            "companies, 75+ fields). Sold as Base and Premium field tiers, " +
            "and for people with or without contact data (emails, phones, " +
            "location, age, sex).",
        homepageUrl: "https://www.datalegion.ai",
        docsUrl: "https://www.datalegion.ai/docs/api-reference/overview",
        categories: ["people-enrichment", "company-enrichment"],
        notes: [
            "The fields returned are those of the product the API key's " +
            "account holds (one person and one company product per " +
            "account); include_fields narrows them but never widens them.",
            "One credit per record returned; a no-match answers 404 and " +
            "costs nothing.",
            "Inputs are normalized upstream (emails, phones, names, URLs, " +
            "locations) - no need to clean them first.",
        ],
    },
    auth: { inject: presets.auth.header("API-Key") },
    request: {
        baseUrl: "https://api.datalegion.ai",
        headers: { "Content-Type": "application/json" },
    },
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    output: {
        /** Data Legion's error body (api-reference/overview "Errors"):
         *  `{error, message, details?}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(data.output, "$.message");
            const code = utils.json.optionalGet(data.output, "$.error");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Data Legion API error",
                ...(typeof code === "string" ? { error_code: code } : {}),
                raw: data.output,
            };
        },
    },
    usage: {
        /** One pool per self-serve product (one credit = one record). */
        credits: {
            person_base: { label: "Person Base, No Contact Data credits" },
            person_base_contact: {
                label: "Person Base with Contact Data credits",
            },
            person_premium: {
                label: "Person Premium, No Contact Data credits",
            },
            person_premium_contact: {
                label: "Person Premium with Contact Data credits",
            },
            company_base: { label: "Company Base credits" },
            company_premium: { label: "Company Premium credits" },
        },
        /** `multiple_results` is not exposed (enterprise-only upstream),
         *  so a call returns at most one record. */
        estimate: () => ({ counts: { RESULT: 1 } }),
        evidence: ({ data, utils }) => ({
            counts: {
                RESULT: utils.json.optionalLen(data.output, "$.matches") ?? 0,
            },
        }),
    },
});
