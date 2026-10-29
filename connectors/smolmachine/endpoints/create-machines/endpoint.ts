import { z } from "zod";
import { defineEndpoint } from "@shared/core";

/**
 * `POST /v1/machines` - create a machine, the smolmachine/machine CREATES
 * anchor. A declarative relay of `CreateMachineRequest` minus the fields
 * that name ACCOUNT-WIDE objects of the pooled account (`credentials`,
 * `mounts`, `cacheDisk`) and the branch/remote-mount surface this
 * connector does not expose.
 */
const zNetwork = z.union([
    z.object({ mode: z.literal("blocked") }).strict(),
    z.object({ mode: z.literal("open") }).strict(),
    z.object({
        mode: z.literal("allowCidrs"),
        hosts: z.array(z.string()).optional(),
        cidrs: z.array(z.string()).optional(),
    }).strict(),
]);

export const zCreateMachineBody = z.object({
    name: z.string().min(1).optional().describe(
        "A name for the machine. Names are unique on the provider account, " +
            "so a taken name answers 409.",
    ),
    source: z.object({
        type: z.enum(["image", "smolmachine"]).describe(
            "`image` for an OCI image, `smolmachine` for a packed artifact.",
        ),
        reference: z.string().min(1).describe(
            "The image reference, e.g. library/alpine:3.20, " +
                "python:3.12-alpine or docker.io/library/node:22. A bare " +
                "name can resolve to the account's own registry, so prefer " +
                "library/<name> for Docker Hub images.",
        ),
        arch: z.enum(["arm64", "amd64"]).optional().describe(
            "Pin the CPU architecture (multi-arch images need none).",
        ),
    }).strict(),
    resources: z.object({
        cpus: z.number().int().min(1).optional().describe("vCPUs."),
        memoryMb: z.number().int().min(1).optional().describe(
            "Memory in MB.",
        ),
        diskGb: z.number().int().min(1).optional().describe(
            "Disk size in GB.",
        ),
    }).strict().optional(),
    network: zNetwork.optional().describe(
        "Outbound networking: `open` (the default), `blocked`, or " +
            "`allowCidrs` with the hosts/cidrs allowed. A blocked machine " +
            "cannot pull an image that is not already cached.",
    ),
    env: z.record(z.string(), z.string()).optional().describe(
        "Environment variables for the machine.",
    ),
    command: z.array(z.string()).optional().describe(
        "Workload argv overriding the image's entrypoint + cmd.",
    ),
    workdir: z.string().optional().describe("Default working directory."),
    autoStopSeconds: z.number().int().min(0).optional().describe(
        "Stop the machine after this many idle seconds (checked every 15 s).",
    ),
    ttlSeconds: z.number().int().min(0).optional().describe(
        "Delete the machine this many seconds after creation, whatever it " +
            "is doing.",
    ),
    ephemeral: z.boolean().optional().describe(
        "Delete the machine (instead of keeping it stopped) once it stops.",
    ),
    labels: z.record(z.string(), z.string()).optional().describe(
        "Free-form key/value labels (at most 32).",
    ),
    ports: z.array(
        z.object({
            port: z.number().int().min(1).max(65535).describe(
                "Guest port the workload listens on (0.0.0.0).",
            ),
        }).strict(),
    ).max(16).optional().describe(
        "Guest ports to publish. A published port forwards the caller's " +
            "authorization header to the app, and `ready` waits for it to " +
            "accept a connection.",
    ),
    public: z.boolean().optional().describe(
        "Make published ports reachable WITHOUT authentication.",
    ),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Create Machine",
        summary:
            "Create a persistent Linux microVM sandbox from a container image.",
        description: "Create a persistent Linux microVM owned by this " +
            "workspace from a container image (`source`), sized with " +
            "`resources` (cpus, memoryMb, diskGb). The machine keeps its " +
            "filesystem - installed packages, /workspace - across " +
            "commands and stop/start until it is deleted, or until " +
            "`ttlSeconds` elapses. It is created STOPPED; the first " +
            "/machines/{id}/exec (or /start) boots it. The returned `id` " +
            "is every other machine endpoint's `id`.",
        docsUrl: "https://smolmachines.com/docs/cloud",
        categories: ["virtual-machines"],
        notes: [
            "This call is free, but the machine SPENDS MONEY from the " +
            "moment it exists: disk always, plus base, CPU and memory " +
            "while it runs, until it is deleted.",
            "Not a list - to see the machines you already own use " +
            "/list-machines (free).",
            "`cpus`/`memoryMb`/`diskGb` must sit under `resources`.",
        ],
    },
    endpoint: "/machines",
    request: { method: "POST", path: "/v1/machines" },
    input: { schema: { body: zCreateMachineBody } },
    resources: {
        provisions: [{
            id: "smolmachine/machine",
            /** A 2xx with no readable id is never "nothing provisioned"
             *  for a metered machine - the throw is the host's alarm. */
            seed: ({ data, utils }) => {
                const $ = utils.json;
                const id = $.optionalStr(data.output, "$.id");
                if (id === undefined) {
                    throw new Error(
                        "smolmachine returned success but no machine id",
                    );
                }
                const name = $.optionalStr(data.output, "$.name");
                const cpus = $.optionalNum(data.output, "$.resources.cpus");
                const memoryMb = $.optionalNum(
                    data.output,
                    "$.resources.memoryMb",
                );
                const diskGb = $.optionalNum(data.output, "$.resources.diskGb");
                const networkMode = $.optionalStr(
                    data.output,
                    "$.network.mode",
                );
                return {
                    resource: "smolmachine/machine",
                    externalId: id,
                    identifier: name ?? id,
                    data: {
                        image: $.optionalStr(
                            data.output,
                            "$.source.reference",
                        ) ?? $.str(data.input.body ?? {}, "$.source.reference"),
                        ...(name !== undefined ? { name } : {}),
                        ...(cpus !== undefined ? { cpus } : {}),
                        ...(memoryMb !== undefined ? { memoryMb } : {}),
                        ...(diskGb !== undefined ? { diskGb } : {}),
                        ...(networkMode !== undefined ? { networkMode } : {}),
                    },
                };
            },
        }],
    },
});
