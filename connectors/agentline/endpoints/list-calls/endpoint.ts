import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zNumberQuery, zPaging } from "../../schema/common.ts";

/**
 * /list-calls - one owned number's call history: `GET /v1/calls` scoped
 * to the number's own persona (`agent_id`, the stored pointer), never
 * the account-wide list.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Calls",
        summary:
            "List the call history of a number you own - inbound and outbound, with status and duration.",
        description: "List the calls placed from or received on one of " +
            "YOUR numbers, newest first: direction, from/to numbers, " +
            "status, duration_seconds and timestamps. Filter by status; " +
            "page with limit/offset. Pass the number id as `number_id`.",
        docsUrl: "https://docs.agentline.cloud/guides/calls",
        categories: ["agentic-phone"],
    },
    endpoint: "/list-calls",
    request: { method: "GET", path: "/v1/calls" },
    input: {
        schema: {
            queryParams: z.object({
                ...zNumberQuery,
                status: z.enum([
                    "initiated",
                    "in-progress",
                    "completed",
                    "failed",
                    "busy",
                    "no-answer",
                    "canceled",
                ]).describe("Only calls in this status.").optional(),
                ...zPaging,
            }).strict(),
        },
    },
    resources: {
        uses: [{
            id: "agentline/phone-number",
            key: "$.queryParams.number_id",
        }],
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const { number_id: _, ...rest } = data.input.queryParams as Record<
                string,
                string | number
            >;
            const res = await utils.http({
                method: "GET",
                url: data.request.url,
                queryParams: {
                    ...Object.fromEntries(
                        Object.entries(rest).map(([k, v]) => [k, String(v)]),
                    ),
                    agent_id: utils.json.str(
                        data.resources!.number_id.data,
                        "$.externalRefs.agent",
                    ),
                },
            });
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
    },
});
