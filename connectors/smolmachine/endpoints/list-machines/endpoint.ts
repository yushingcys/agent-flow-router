import { defineEndpoint } from "@shared/core";

/**
 * List YOUR machines, served entirely from the ownership window - never
 * smol's `GET /v1/machines`, which lists every tenant of the pooled
 * account.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Your Machines",
        summary: "List the machines you own (id, image, size).",
        description: "List the machines this workspace owns: each one's " +
            "`machineId` (what every other machine endpoint takes as " +
            "`id`), name, image, the declared size (cpus, memoryMb, " +
            "diskGb) and network mode. Use /machines/{id}/events for why " +
            "a machine is or is not running.",
        docsUrl: "https://smolmachines.com/docs/cloud",
        categories: ["virtual-machines"],
    },
    endpoint: "/list-machines",
    request: { method: "GET", path: "/v1/machines" },
    resources: { reads: [{ id: "smolmachine/machine" }] },
    lifecycle: {
        start: async ({ utils }) => {
            const rows = await utils.resources.owned({
                resource: "smolmachine/machine",
            });
            const machines = rows.map((row) => ({
                machineId: row.externalId,
                ...(typeof row.data === "object" && row.data !== null &&
                        !Array.isArray(row.data)
                    ? row.data
                    : {}),
                ...(row.syncedAt !== undefined
                    ? { syncedAt: row.syncedAt }
                    : {}),
            }));
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: { count: machines.length, machines },
            };
        },
    },
});
