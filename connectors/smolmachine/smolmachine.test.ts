import {
    assert,
    assertAlmostEquals,
    assertEquals,
    assertRejects,
} from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json, OwnedResource } from "@shared/core";
import {
    loadFixture,
    loadResource,
    runEndpoint,
    testResourceUnit,
    testSealedUnit,
} from "@shared/testing";

/**
 * The smolmachine suite. Chains are SYNTHETIC, built from the documented
 * OpenAPI shapes (smolmachines.com/openapi.json, read 2026-10-29) and the
 * vendor's cloud-machine / cloud-usage skill packets. Ownership is the
 * fixture's story: `resources` seeds the reader, and a foreign id proves
 * the uniform 404 with zero upstream calls.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const fixture = (name: string) => loadFixture(`${HERE}fixtures/${name}.json`);

const MACHINE: OwnedResource = {
    resource: "smolmachine/machine",
    externalId: "mach-1",
    data: { name: "sandbox", image: "library/alpine:3.20", cpus: 1 },
    syncedAt: "2026-10-29T10:00:00.000Z",
};
const OWNED = [MACHINE];
const out = (value: Json) => value as Record<string, Json>;

Deno.test("smolmachine create: provisions the machine, free, pooled ids stripped", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#machines"),
        input: {
            body: {
                name: "sandbox",
                source: { type: "image", reference: "library/alpine:3.20" },
                resources: { cpus: 1, memoryMb: 512, diskGb: 10 },
                network: { mode: "open" },
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-create-machine"),
        resources: [],
    });
    assertEquals(result.httpStatus, 201);
    assertEquals(result.usage.credits, {});
    const seed = result.resources?.provisions?.[0];
    assert(seed !== undefined, "expected a provision seed");
    assertEquals(seed.externalId, "mach-1");
    assertEquals(seed.data, {
        name: "sandbox",
        image: "library/alpine:3.20",
        cpus: 1,
        memoryMb: 512,
        diskGb: 10,
        networkMode: "open",
    });
    assertEquals(out(result.output).createdBy, undefined);
});

Deno.test("smolmachine create: account-wide references are refused before the wire", async () => {
    const unit = await testSealedUnit("smolmachine#machines");
    await assertRejects(
        () =>
            runEndpoint({
                unit,
                input: {
                    body: {
                        source: { type: "image", reference: "alpine" },
                        credentials: ["someone-elses"],
                    },
                },
                mode: "replay",
                resources: [],
            }),
        Error,
        "INVALID_INPUT",
    );
});

Deno.test("smolmachine list-machines: served from the ownership window only", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#list-machines"),
        input: {},
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(result.output, {
        count: 1,
        machines: [{
            machineId: "mach-1",
            name: "sandbox",
            image: "library/alpine:3.20",
            cpus: 1,
            syncedAt: "2026-10-29T10:00:00.000Z",
        }],
    });
});

Deno.test("smolmachine exec: a failing guest command is a 200 with its exitCode; foreign ids 404", async () => {
    const unit = await testSealedUnit("smolmachine#machines/{id}/exec");
    assertEquals(
        (unit.doc.input.schema.body?.properties as Record<string, Json>)
            .timeoutSeconds,
        {
            type: "integer",
            minimum: 1,
            maximum: 25,
            default: 25,
            description:
                "Kill the command after this many seconds (exitCode 124).",
        },
    );
    const input = {
        pathParams: { id: "mach-1" },
        body: { command: "echo OUT; echo ERR >&2; exit 42" },
    };
    const ran = await runEndpoint({
        unit,
        input,
        mode: "replay",
        fixture: await fixture("synthetic-exec"),
        resources: OWNED,
    });
    assertEquals(ran.httpStatus, 200);
    assertEquals(out(ran.output).exitCode, 42);
    assertEquals(ran.usage.credits, {});
    const foreign = await runEndpoint({
        unit,
        input: { ...input, pathParams: { id: "mach-other" } },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(foreign.httpStatus, 404);
});

Deno.test("smolmachine exec: a problem+json error lifts its detail", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#machines/{id}/exec"),
        input: { pathParams: { id: "mach-1" }, body: { command: ["true"] } },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(
        out(result.output).message,
        "API key lacks the machine:exec scope",
    );
});

Deno.test("smolmachine exec/async: submit, poll to exited, collect both streams", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#machines/{id}/exec/async"),
        input: {
            pathParams: { id: "mach-1" },
            body: { command: ["sh", "-c", "make test"] },
        },
        mode: "replay",
        fixture: await fixture("synthetic-job-run"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    const job = out(result.output);
    assertEquals(job.state, "exited");
    assertEquals(job.exitCode, 0);
    assertEquals(job.stdout, "all pass\n");
    assertEquals(job.stdoutTruncated, false);
    assertEquals(job.stderr, "");
});

Deno.test("smolmachine files/upload: base64 rides exec stdin and is decoded in the guest", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#machines/{id}/files/upload"),
        input: {
            pathParams: { id: "mach-1" },
            body: { path: "/workspace/hello.txt", content_base64: "aGVsbG8=" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-upload"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.output, {
        machineId: "mach-1",
        path: "/workspace/hello.txt",
        size: 5,
    });
});

Deno.test("smolmachine files/upload: content and url together is a 400, never sent", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#machines/{id}/files/upload"),
        input: {
            pathParams: { id: "mach-1" },
            body: {
                path: "/workspace/a",
                content_base64: "AA==",
                file_url: "https://example.com/a",
            },
        },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 400);
});

Deno.test("smolmachine files/download: the guest path is a per-segment route suffix; bytes come back base64", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("smolmachine#machines/{id}/files/download"),
        input: {
            pathParams: { id: "mach-1" },
            queryParams: { path: "/workspace/out dir/a.bin" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-download"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.output, {
        path: "/workspace/out dir/a.bin",
        contentType: "application/octet-stream",
        content_base64: "AAEC",
    });
});

Deno.test("smolmachine machine resource: verify, reconcile the vendor's own cost, idempotent release", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("smolmachine/machine"),
        mode: "replay",
        fixture: await fixture("synthetic-resource-ops"),
    });
    assertEquals(await resource.verify(MACHINE), { active: true });
    const reading = await resource.reconcileUsage("metered", MACHINE, {
        startIso: "2026-10-01T00:00:00Z",
        endIso: "2026-10-29T12:00:00Z",
    });
    // base + cpu + memory + disk + egress micros; never exec or the fee
    assertAlmostEquals(reading.consumes.amount, 1811 / 1_000_000);
    assertEquals(await resource.release(MACHINE), { released: true });
});

Deno.test("smolmachine machine resource: a meter that rolled into a new month cannot settle the old one", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("smolmachine/machine"),
        mode: "replay",
        fixture: await fixture("synthetic-usage-rolled-over"),
    });
    await assertRejects(() =>
        resource.reconcileUsage("metered", MACHINE, {
            startIso: "2026-10-01T00:00:00Z",
            endIso: "2026-11-01T00:00:00Z",
        })
    );
});
