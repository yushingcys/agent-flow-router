import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
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
 * The agent, profile, and remote-browser endpoints plus the
 * tinyfish/browser-session resource. Chains are SYNTHETIC (shapes from
 * TinyFish's published OpenAPI specs, checked 2026-10-27) until a keyed
 * recording replaces them.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const fixture = (name: string) => loadFixture(`${HERE}fixtures/${name}.json`);

const AGENT_INPUT = {
    body: { url: "https://example.com", goal: "Extract the plan names" },
};

Deno.test("tinyfish#automation/run: submit, poll to COMPLETED, bill the reported steps", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tinyfish#automation/run"),
        input: AGENT_INPUT,
        mode: "replay",
        fixture: await fixture("synthetic-agent-completed"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage.evidence, { RESULT: 7 });
    assertAlmostEquals(result.usage.credits.default as number, 7 * 0.016);
    assertEquals(
        (result.output as Record<string, Json>).result,
        { plans: ["Starter", "Pro"] },
    );
});

Deno.test("tinyfish#automation/run: a FAILED run is an error and bills nothing", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tinyfish#automation/run"),
        input: AGENT_INPUT,
        mode: "replay",
        fixture: await fixture("synthetic-agent-failed"),
    });
    assertEquals(result.httpStatus, 500);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("tinyfish#automation/run: an up-front refusal is data, nothing polled", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tinyfish#automation/run"),
        input: AGENT_INPUT,
        mode: "replay",
        fixture: await fixture("synthetic-agent-rejected"),
    });
    assertEquals(result.httpStatus, 402);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("tinyfish#automation/run: run-async is the wire, max_steps is never required", async () => {
    const unit = await testSealedUnit("tinyfish#automation/run");
    assertEquals(
        unit.doc.request.url,
        "https://agent.tinyfish.ai/v1/automation/run-async",
    );
    assertEquals(unit.doc.input.schema.body?.required, ["url", "goal"]);
});

Deno.test("tinyfish free tiers are the same vendor call under their own ids", async () => {
    for (
        const [paid, free] of [["fetch", "free/fetch"], [
            "search",
            "free/search",
        ]]
    ) {
        const a = (await testSealedUnit(`tinyfish#${paid}`)).doc;
        const b = (await testSealedUnit(`tinyfish#${free}`)).doc;
        assertEquals(b.request, a.request);
        assertEquals(b.input, a.input);
        assertEquals(b.usage.model, { kind: "FREE" });
    }
});

const PROFILE_CASES: [string, Record<string, Json>, string, number][] = [
    [
        "browser-profiles/provision",
        { body: { name: "Work Gmail" } },
        "synthetic-profile-created",
        201,
    ],
    [
        "browser-profiles/release",
        { pathParams: { profileId: "prof_1" } },
        "synthetic-profile-deleted",
        200,
    ],
    [
        "browser-profiles/setup-session",
        {
            pathParams: { profileId: "prof_1" },
            body: { url: "https://github.com/login" },
        },
        "synthetic-profile-setup-session",
        201,
    ],
    [
        "browser-profiles/setup-save",
        {
            pathParams: { profileId: "prof_1" },
            body: { session_id: "br-setup-1" },
        },
        "synthetic-profile-saved",
        200,
    ],
    [
        "browser-profiles/setup-cancel",
        {
            pathParams: { profileId: "prof_1" },
            body: { session_id: "br-setup-1" },
        },
        "synthetic-profile-setup-cancelled",
        200,
    ],
];

for (const [path, input, chain, status] of PROFILE_CASES) {
    Deno.test(`tinyfish#${path}: free profile call on the agent host`, async () => {
        const unit = await testSealedUnit(`tinyfish#${path}`);
        assert(
            unit.doc.request.url.startsWith(
                "https://agent.tinyfish.ai/v1/profiles",
            ),
        );
        const result = await runEndpoint({
            unit,
            input,
            mode: "replay",
            fixture: await fixture(chain),
        });
        assertEquals(result.httpStatus, status);
        assertEquals(result.usage, { credits: {}, evidence: {} });
    });
}

const SESSION: OwnedResource = {
    resource: "tinyfish/browser-session",
    externalId: "br-1",
    data: {},
    syncedAt: "2026-10-27T10:00:00.000Z",
};

Deno.test("tinyfish#browser-sessions/provision: free call that seeds the per-minute resource", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tinyfish#browser-sessions/provision"),
        input: { body: { timeout_seconds: 300 } },
        mode: "replay",
        fixture: await fixture("synthetic-browser-provisioned"),
    });
    assertEquals(result.httpStatus, 201);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const seed = result.resources?.provisions?.[0];
    assert(seed !== undefined, "expected a provision seed");
    assertEquals(seed.resource, "tinyfish/browser-session");
    assertEquals(seed.externalId, "br-1");
    assertEquals(
        (result.output as Record<string, Json>).cdp_url,
        "wss://tetra-abc.cluster.example/cdp",
    );
});

Deno.test("tinyfish#browser-sessions/release: terminates upstream and marks the release", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tinyfish#browser-sessions/release"),
        input: { pathParams: { sessionId: "br-1" } },
        mode: "replay",
        fixture: await fixture("synthetic-browser-released"),
        resources: [SESSION],
    });
    assertEquals(result.httpStatus, 204);
    assertEquals(result.resources?.releases, [{
        resource: "tinyfish/browser-session",
        externalId: "br-1",
    }]);
});

Deno.test("tinyfish#browser-sessions/release: a session you do not own is never touched", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tinyfish#browser-sessions/release"),
        input: { pathParams: { sessionId: "br-1" } },
        mode: "replay",
        // no fixture: the ownership gate answers before any upstream call
        resources: [],
    });
    assertEquals(result.httpStatus, 404);
    assertEquals(result.resources?.releases, undefined);
});

Deno.test("tinyfish/browser-session: verify, meter a running session, release, meter the ended one", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("tinyfish/browser-session"),
        mode: "replay",
        fixture: await fixture("synthetic-browser-resource-ops"),
    });
    assertEquals(await resource.verify(SESSION), { active: true });
    const running = await resource.reconcileUsage("minutes", SESSION, {
        startIso: "2026-10-27T10:00:00Z",
        endIso: "2026-10-27T10:15:00Z",
    });
    // 15 minutes so far, counted to the window end
    assertAlmostEquals(running.consumes.amount, 15 * 0.002);
    assertEquals(await resource.release(SESSION), { released: true });
    const ended = await resource.reconcileUsage("minutes", SESSION, {
        startIso: "2026-10-27T10:00:00Z",
        endIso: "2026-10-27T10:20:00Z",
    });
    // the record's own end bounds the tail: 10 minutes, not 20
    assertAlmostEquals(ended.consumes.amount, 10 * 0.002);
});

Deno.test("tinyfish/browser-session: a session that timed out is inactive", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("tinyfish/browser-session"),
        mode: "replay",
        fixture: await fixture("synthetic-browser-resource-ended"),
    });
    assertEquals(await resource.verify(SESSION), {
        active: false,
        inactiveReason: "ended",
    });
});
