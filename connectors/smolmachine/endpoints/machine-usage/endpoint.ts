import { defineEndpoint } from "@shared/core";
import { zMachinePath } from "../../schema/common.ts";

/**
 * `GET /v1/machines/{id}/usage` - the machine's meter this calendar
 * month, the same read the resource reconciles its bill from.
 */
export default defineEndpoint({
    meta: {
        displayName: "Machine Usage & Cost",
        summary: "What one machine has used and cost this month.",
        description: "Read one machine's meter for the calendar month to " +
            "date: uptime seconds, cpu-hours, memory GB-hours, disk " +
            "GB-hours, egress GB, and the cost of each in `cost` (integer " +
            "MICRO-dollars: 1,000,000 = $1). It is the window the machine " +
            "bills on, so it previews the bill accruing now; a mid-life " +
            "read can lag the settled figure slightly.",
        docsUrl: "https://smolmachines.com/docs/guides/skills/cloud-usage",
        categories: ["virtual-machines"],
        notes: [
            "Every cost field is in micros, not cents: divide by 1,000,000 " +
            "for dollars.",
        ],
    },
    endpoint: "/machines/{id}/usage",
    request: { method: "GET", path: "/v1/machines/{id}/usage" },
    input: { schema: { pathParams: zMachinePath } },
    resources: {
        reads: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
