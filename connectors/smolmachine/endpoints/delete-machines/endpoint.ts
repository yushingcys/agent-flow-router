import { defineEndpoint } from "@shared/core";
import { zMachinePath } from "../../schema/common.ts";

/**
 * `DELETE /v1/machines/{id}` - the smolmachine/machine RELEASES anchor.
 * The machine is deleted IN the run (its meter must stop now, not at a
 * period end); the settle mark then has the host settle the final window,
 * and the resource's own `release` op stays safe to run after it (404 is
 * done).
 */
export default defineEndpoint({
    meta: {
        displayName: "Delete Machine",
        summary:
            "Permanently delete a machine you own, including its stored data.",
        description: "Stop and delete a machine and its filesystem. All " +
            "metering ends, disk included. Export anything you need first " +
            "with /machines/{id}/files/download - deletion is immediate " +
            "and irreversible.",
        docsUrl:
            "https://smolmachines.com/docs/cloud/lifecycle-storage-networking",
        categories: ["virtual-machines"],
        notes: [
            "Irreversible: guest files are unrecoverable after deletion.",
        ],
    },
    endpoint: "/machines/{id}/delete",
    request: { method: "DELETE", path: "/v1/machines/{id}" },
    input: { schema: { pathParams: zMachinePath } },
    resources: {
        releases: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
