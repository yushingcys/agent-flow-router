import { defineEndpoint } from "@shared/core";
import { zMachinePath } from "../../schema/common.ts";

/** `POST /v1/machines/{id}/stop` - stop compute, keep the disk. */
export default defineEndpoint({
    meta: {
        displayName: "Stop Machine",
        summary: "Stop a machine you own; its filesystem is preserved.",
        description: "Stop a running machine. Base, CPU and memory metering " +
            "stop at once; the disk keeps metering and the filesystem " +
            "persists, so the next exec or /start brings it back intact. " +
            "Nothing else stops a machine unless it was created with " +
            "`autoStopSeconds`.",
        docsUrl:
            "https://smolmachines.com/docs/cloud/lifecycle-storage-networking",
        categories: ["virtual-machines"],
    },
    endpoint: "/machines/{id}/stop",
    request: { method: "POST", path: "/v1/machines/{id}/stop" },
    input: { schema: { pathParams: zMachinePath } },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
