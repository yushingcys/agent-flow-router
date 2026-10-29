import { z } from "zod";

/**
 * The smol cloud input mirrors shared across endpoints (OpenAPI
 * smolmachines.com/openapi.json, smolfleet 0.1.0, read 2026-10-29).
 * Optionality only, no defaults.
 */

export const zMachineId = z.string().min(1).describe(
    "The id of a machine YOU OWN (`mach-...`, from /machines or " +
        "/list-machines).",
);

/** Path params of every machine-scoped route. */
export const zMachinePath = z.object({ id: zMachineId }).strict();

/** `CommandSpec`: an argv array, or one shell string. */
export const zCommand = z.union([z.array(z.string()).min(1), z.string().min(1)])
    .describe(
        'An argv array (["python3", "/workspace/app.py"]) or one shell ' +
            'string ("apk add --no-cache python3 && python3 -V").',
    );

/** The run-context fields exec, code and jobs share. */
export const zRunContext = {
    cwd: z.string().optional().describe("Working directory in the guest."),
    env: z.record(z.string(), z.string()).optional().describe(
        "Extra environment variables for this command.",
    ),
    user: z.string().optional().describe(
        "Run as this user: a name from the image or a numeric uid[:gid].",
    ),
};

export const zGuestPath = z.string().regex(/^\/[^\0]*[^/]$/).describe(
    "Absolute guest file path, e.g. /workspace/app.py. /workspace and the " +
        "image filesystem persist across stop/start; /tmp, /run and " +
        "/dev/shm are memory-backed and empty after a stop.",
);
