import { defineEndpoint } from "@shared/core";
import { zMachinePath } from "../../schema/common.ts";

/** `POST /v1/machines/{id}/start` - boot a stopped machine you own. */
export default defineEndpoint({
    meta: {
        displayName: "Start Machine",
        summary: "Start a machine you own; its filesystem comes back intact.",
        description: "Boot a stopped machine. Returns the machine record " +
            "once the VM has launched, with the filesystem exactly as it " +
            "was left - installed packages and /workspace survive; the " +
            "memory-backed /tmp, /run and /dev/shm come back empty. " +
            "Running a command auto-starts a machine too, so this is for " +
            "warming one up or bringing back a service.",
        docsUrl:
            "https://smolmachines.com/docs/cloud/lifecycle-storage-networking",
        categories: ["virtual-machines"],
        notes: [
            '`state: "started"` means the VM launched; `ready: true` ' +
            "means the guest agent and every published port answer.",
        ],
    },
    endpoint: "/machines/{id}/start",
    request: { method: "POST", path: "/v1/machines/{id}/start" },
    input: { schema: { pathParams: zMachinePath } },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
