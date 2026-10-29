import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * smol machines (smolmachines.com) - smol cloud, persistent Linux microVM
 * sandboxes: create a machine from a container image, run commands and
 * code in it, move files in and out, stop and start it with its
 * filesystem intact. Bearer-key REST against `https://api.smolmachines.com`
 * (smolfleet API 0.1.0, OpenAPI at smolmachines.com/openapi.json, read
 * 2026-10-29).
 *
 * POOLED TENANCY: Agent Flow holds ONE smol cloud account for every
 * workspace, so `GET /v1/machines` (every tenant's machines) is never
 * relayed. A machine is an OWNED RESOURCE and every machine route is
 * gated on its id; account-wide objects a create could reference (stored
 * credentials, volumes, cache disks) are not accepted.
 *
 * RATE CARD (smolmachines.com/pricing and the live
 * `GET /v1/pricing`, read 2026-10-29): API calls are free; a machine
 * meters itself - $0.04 per running machine-hour (1-minute minimum),
 * $0.05 per vCPU-hour consumed, $0.0162 per GB-hour of memory in use,
 * $0.0001 per GB-hour of disk used (stopped machines too), $0.05 per GB
 * of egress. That meter is the smolmachine/machine resource's one
 * estimated line, reconciled from the vendor's own per-machine cost.
 */
export default defineProvider({
    name: "smolmachine",
    meta: {
        displayName: "Smol Machines",
        summary:
            "Persistent Linux microVM sandboxes - run commands, code and files in a machine you own.",
        description: "smol cloud gives an agent its own persistent Linux " +
            "microVM: create one from any container image, run shell " +
            "commands or code snippets in it (short ones inline, long " +
            "ones as polled jobs), upload and download files, and stop " +
            "and start it with its filesystem intact. Machines are " +
            "workspace-OWNED resources: API calls are free, and each " +
            "machine meters running time, CPU, memory, disk and egress " +
            "until it is deleted.",
        homepageUrl: "https://smolmachines.com",
        docsUrl: "https://smolmachines.com/docs/cloud",
        categories: ["virtual-machines"],
        notes: [
            "Machines are OWNED RESOURCES: machine-scoped endpoints only " +
            "operate on machines this workspace created - a foreign or " +
            "unknown id is a uniform 404.",
            "A command that fails inside the guest is NOT an HTTP error: " +
            "the response is 200 with the guest's exitCode (124 = timed " +
            "out). Check exitCode.",
            "Running a command or code auto-starts a stopped machine and " +
            "LEAVES IT RUNNING; stop it when you are done for a while.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.smolmachines.com" },
    usage: { model: { kind: UsageModelKind.FREE } },
    output: {
        /** Pooled-account identifiers are plumbing, never user data. */
        fromResponse: ({ data, utils }) =>
            utils.json.omit(data.output, ["createdBy", "tenantId"]),
        /** smol answers RFC 9457 problem+json: `{type, title, status,
         *  detail, code, retryable?}`. */
        fromError: ({ data, utils }) => {
            const detail = utils.json.optionalStr(data.output, "$.detail");
            const title = utils.json.optionalStr(data.output, "$.title");
            return {
                message: detail !== undefined && detail !== ""
                    ? detail
                    : title !== undefined && title !== ""
                    ? title
                    : "smol cloud API error",
                raw: utils.json.omit(data.output, ["createdBy", "tenantId"]),
            };
        },
    },
});
