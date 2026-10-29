import { z } from "zod";
import { defineEndpoint, type Json } from "@shared/core";
import { zCallId, zNumberQuery } from "../../schema/common.ts";

/**
 * /calls/{id} - one call on an owned number. The pooled account answers
 * for ANY tenant's call id, so the call is PAIR-VERIFIED: its `agent_id`
 * must be the gated number's persona, else the uniform 404.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Call",
        summary:
            "Get one call's detail - status, duration, direction and transcript.",
        description: "Read one call placed from or received on one of YOUR " +
            "numbers: direction, from/to numbers, status, " +
            "duration_seconds, start/end times, the persona settings used " +
            "and the transcript. Pass the call id as `id` and the number " +
            "id as `number_id`.",
        docsUrl: "https://docs.agentline.cloud/guides/calls",
        categories: ["agentic-phone"],
    },
    endpoint: "/calls/{id}",
    request: { method: "GET", path: "/v1/calls/{id}" },
    input: {
        schema: {
            pathParams: z.object({ id: zCallId }).strict(),
            queryParams: z.object(zNumberQuery).strict(),
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
            const $ = utils.json;
            const res = await utils.http({
                method: "GET",
                url: data.request.url,
            });
            if (res.status >= 500) {
                throw new Error(
                    "agentline call lookup failed with HTTP " + res.status,
                );
            }
            if (
                res.status < 200 || res.status >= 300 ||
                $.optionalStr(res.body, "$.agent_id") !==
                    $.str(
                        data.resources!.number_id.data,
                        "$.externalRefs.agent",
                    )
            ) {
                return {
                    kind: "COMPLETED",
                    httpStatus: 404,
                    providerHttpStatus: res.status,
                    output: { detail: "Call not found" } as Json,
                };
            }
            return { kind: "COMPLETED", httpStatus: 200, output: res.body };
        },
    },
});
