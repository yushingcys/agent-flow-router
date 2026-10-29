import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zSearchCompaniesBody } from "./schema/inputs.ts";

const shape = zSearchCompaniesBody.shape;

/** POST /v2/companies - 1 credit per full company record returned. */
export default defineEndpoint({
    meta: {
        displayName: "Search companies",
        summary:
            "Search companies with segmentation conditions; 1 credit per company.",
        description: "Search 50M+ companies with segmentation conditions " +
            "(industries, headquarters location, employee count, revenue, " +
            "founding year, technologies, NAICS / SIC codes, monthly " +
            "visitors) and/or free-text name or domain search, sorted and " +
            "paginated. Returns the full company records plus pagination " +
            "meta. `simplified` previews light records for free. Use Count " +
            "companies first to size a segment.",
        docsUrl: "https://www.thecompaniesapi.com/api/search-companies",
        notes: [
            "1 credit per company returned (size defaults to 10, max 100); " +
            "simplified results are free.",
        ],
    },
    endpoint: "/search_companies",
    request: { method: "POST", path: "/v2/companies" },
    input: {
        schema: {
            body: zSearchCompaniesBody.extend({
                size: shape.size.unwrap().default(10),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "companies returned",
            consumes: { credit: "default", amount: 1 },
        },
        estimate: ({ data }) => ({
            counts: {
                RESULT: data.input.body.simplified ? 0 : data.input.body.size,
            },
        }),
        evidence: ({ data, utils }) => ({
            counts: {
                RESULT: data.input.body.simplified
                    ? 0
                    : utils.json.optionalLen(data.output, "$.companies") ?? 0,
            },
        }),
    },
});
