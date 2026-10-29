import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zEnrichPathParams, zEnrichQueryParams } from "./schema/inputs.ts";

/** GET /v2/companies/{domain} - 1 credit, +10 with refresh, 0 simplified. */
export default defineEndpoint({
    meta: {
        displayName: "Enrich company from domain",
        summary: "Full company profile (80+ data points) from a domain.",
        description: "Enrich a company from its domain: name, description, " +
            "industries, business type, employee count, founding year, " +
            "revenue, headquarters and other locations, NAICS / SIC codes, " +
            "technologies, apps, social profiles, website analytics, " +
            "contacts and related companies. `simplified` returns a light " +
            "record for free; `refresh` re-crawls the website and socials " +
            "in real time before answering.",
        docsUrl:
            "https://www.thecompaniesapi.com/api/enrich-company-from-domain",
        notes: [
            "1 credit per company found; refresh adds 10 credits; " +
            "simplified is free. An unknown domain returns an empty object " +
            "and costs nothing.",
        ],
    },
    endpoint: "/enrich_company_from_domain",
    request: { method: "GET", path: "/v2/companies/{domain}" },
    input: {
        schema: {
            pathParams: zEnrichPathParams,
            queryParams: zEnrichQueryParams,
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.CREDIT,
            label: "credits",
            consumes: { credit: "default", amount: 1 },
        },
        estimate: ({ data }) => {
            const q = data.input.queryParams ?? {};
            return {
                counts: {
                    CREDIT: q.simplified ? 0 : 1 + (q.refresh ? 10 : 0),
                },
            };
        },
        evidence: ({ data, utils }) => {
            const q = data.input.queryParams ?? {};
            const found =
                utils.json.optionalGet(data.output, "$.domain") !== undefined;
            return {
                counts: {
                    CREDIT: !found || q.simplified
                        ? 0
                        : 1 + (q.refresh ? 10 : 0),
                },
            };
        },
    },
});
