import { defineEndpoint, UsageModelKind } from "@shared/core";

/** GET /v1/filters/list - the List Generation filter catalog, free. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Filters List",
        summary: "Every filter key accepted by list generation - free.",
        description: "List every filter accepted by Akta Company List " +
            "Generation: its key, the shape its value must take (string, " +
            "list, bool, or a gte/lte range), a description, and whether " +
            "its values come from Akta Filter Options (then a " +
            "'dropdown_type' to pass there) or are supplied directly. " +
            "Takes no parameters. Free - consumes 0 credits.",
        docsUrl: "https://agent-docs.akta.pro/api-reference/filters-list",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/filters/list/" },
    usage: { model: { kind: UsageModelKind.FREE } },
});
