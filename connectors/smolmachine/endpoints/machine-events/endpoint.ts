import { defineEndpoint } from "@shared/core";
import { zMachinePath } from "../../schema/common.ts";

/** `GET /v1/machines/{id}/events` - the machine's lifecycle log. */
export default defineEndpoint({
    meta: {
        displayName: "Machine Events",
        summary: "The audit trail for one machine - why it started or stopped.",
        description: "Read a machine's event log (created, started, " +
            "stopped, errors, each with a level, message and time). This " +
            "is how you find out why a machine is not running when you " +
            "expected it to be: an idle `autoStopSeconds` stop and a " +
            "`ttlSeconds` deletion both happen on their own.",
        docsUrl:
            "https://smolmachines.com/docs/cloud/lifecycle-storage-networking",
        categories: ["virtual-machines"],
    },
    endpoint: "/machines/{id}/events",
    request: { method: "GET", path: "/v1/machines/{id}/events" },
    input: { schema: { pathParams: zMachinePath } },
    resources: {
        reads: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
