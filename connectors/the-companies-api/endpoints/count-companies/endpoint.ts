import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCountCompaniesBody } from "./schema/inputs.ts";

/** POST /v2/companies/count - free segment sizing. */
export default defineEndpoint({
    meta: {
        displayName: "Count companies",
        summary:
            "Count the companies matching segmentation conditions, for free.",
        description: "Count how many companies match a segmentation query " +
            "(industry, headquarters country / state / city, employee " +
            "count, revenue, founding year, technologies, NAICS / SIC " +
            "codes) and/or a free-text name or domain search. Returns " +
            "`{count}`. Use it to size a segment before paying for Search " +
            "companies.",
        docsUrl: "https://www.thecompaniesapi.com/api/count-companies",
        notes: ["Free: no credits are drawn."],
    },
    endpoint: "/count_companies",
    request: { method: "POST", path: "/v2/companies/count" },
    input: { schema: { body: zCountCompaniesBody } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
