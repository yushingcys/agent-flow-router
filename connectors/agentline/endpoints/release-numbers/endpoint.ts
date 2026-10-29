import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zNumberId } from "../../schema/common.ts";

/**
 * /release-numbers/{id} - stop renewing a number you own, the RELEASES
 * anchor. The run makes NO upstream call: the binding pre-gates ownership
 * and the success settle marks the release, so the host stops billing,
 * keeps the number usable until its paid-through date, then runs the
 * resource's `release` op (number release + persona delete) once.
 */
export default defineEndpoint({
    meta: {
        displayName: "Release Phone Number",
        summary:
            "Stop renewing a phone number; it stays active until its paid-through date.",
        description: "Release a phone number you own. Renewals stop at " +
            "once; the number keeps answering calls and texts until the " +
            "end of the month already paid for, then it is released back " +
            "to the carrier together with its persona. No refunds for the " +
            "current month.",
        docsUrl: "https://docs.agentline.cloud/guides/numbers",
        categories: ["agentic-phone"],
        notes: [
            "Call history, transcripts and texts are deleted with the " +
            "persona when the number is finally released - read them " +
            "before then.",
        ],
    },
    endpoint: "/release-numbers/{id}",
    /** The real upstream route; the host's wind-down calls it through the
     *  resource's release op, never this run. */
    request: { method: "POST", path: "/v1/numbers/{id}/release" },
    input: {
        schema: { pathParams: z.object({ id: zNumberId }).strict() },
    },
    resources: {
        releases: [{ id: "agentline/phone-number", key: "$.pathParams.id" }],
    },
    lifecycle: {
        // deno-lint-ignore require-await
        start: async ({ data }) => ({
            kind: "COMPLETED",
            httpStatus: 202,
            output: {
                id: (data.input.pathParams as Record<string, unknown>)
                    .id as string,
                status: "release_requested",
                note: "Renewals stopped. The number stays active until " +
                    "its paid-through date, then is released.",
            },
        }),
    },
});
