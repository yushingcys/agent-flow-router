import { defineEndpoint, UsageModelKind } from "@shared/core";
import {
    zEmailPatternsPathParams,
    zEmailPatternsQueryParams,
} from "./schema/inputs.ts";

/** GET /v2/companies/{domain}/email-patterns - 1 credit per request. */
export default defineEndpoint({
    meta: {
        displayName: "Find company email patterns",
        summary:
            "Email address patterns a company uses, with usage percentages.",
        description: "Send a company domain and get the email address " +
            "patterns its employees use (e.g. {first}.{last}@domain) with " +
            "each pattern's usage percentage and, optionally, the number " +
            "of emails observed. Use it to guess a business email before " +
            "verifying it.",
        docsUrl:
            "https://www.thecompaniesapi.com/api/fetch-company-email-patterns",
        notes: ["1 credit per request."],
    },
    endpoint: "/find_company_email_patterns",
    request: { method: "GET", path: "/v2/companies/{domain}/email-patterns" },
    input: {
        schema: {
            pathParams: zEmailPatternsPathParams,
            queryParams: zEmailPatternsQueryParams,
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "request",
            consumes: { credit: "default", amount: 1 },
        },
    },
});
