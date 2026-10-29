import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zNumberQuery } from "../../schema/common.ts";

/**
 * /list-conversations - one owned number's SMS threads:
 * `GET /v1/messages/conversations` scoped to the number's persona. Its
 * start is byte-identical to /list-calls and /list-messages (the url comes
 * from `data.request.url`), so all three intern to one fn.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Text Conversations",
        summary:
            "List the text conversations of a number you own, one per contact.",
        description: "List the SMS conversations of one of YOUR numbers: " +
            "one row per contact number with its conversation id and " +
            "last-message time. Pass a conversation id as " +
            "`conversation_id` to /list-messages to read that thread. Pass " +
            "the number id as `number_id`.",
        docsUrl: "https://docs.agentline.cloud/guides/messages",
        categories: ["agentic-phone"],
    },
    endpoint: "/list-conversations",
    request: { method: "GET", path: "/v1/messages/conversations" },
    input: { schema: { queryParams: z.object(zNumberQuery).strict() } },
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
