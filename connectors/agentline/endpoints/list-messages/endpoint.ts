import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zNumberQuery, zPaging } from "../../schema/common.ts";

/**
 * /list-messages - one owned number's texts: `GET /v1/messages` scoped
 * to the number's own persona (`agent_id`, the stored pointer), never
 * the account-wide list.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Text Messages",
        summary:
            "List the text messages sent and received by a number you own.",
        description: "List the SMS/MMS messages of one of YOUR numbers, " +
            "newest first: direction, from/to numbers, body, media_url, " +
            "delivery status, conversation_id and timestamp. Filter to one " +
            "conversation (from /list-conversations); page with " +
            "limit/offset. Use it to read verification codes and replies " +
            "sent to your number. Pass the number id as `number_id`.",
        docsUrl: "https://docs.agentline.cloud/guides/messages",
        categories: ["agentic-phone"],
    },
    endpoint: "/list-messages",
    request: { method: "GET", path: "/v1/messages" },
    input: {
        schema: {
            queryParams: z.object({
                ...zNumberQuery,
                conversation_id: z.string().min(1).describe(
                    "Only messages in this conversation.",
                ).optional(),
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
