import { assert, assertEquals, assertRejects } from "@std/assert";
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
 * The agentline suite. Chains are SYNTHETIC, built from the documented
 * request shapes and guide examples (api.agentline.cloud/openapi.json
 * 0.3.0 and docs.agentline.cloud, read 2026-10-29 - the spec publishes no
 * response schemas). Ownership is the fixture's story: `resources` seeds
 * the reader, and a foreign id proves the uniform 404.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const fixture = (name: string) => loadFixture(`${HERE}fixtures/${name}.json`);

const NUMBER: OwnedResource = {
    resource: "agentline/phone-number",
    externalId: "num_1",
    data: {
        phoneNumber: "+14155550100",
        country: "US",
        externalRefs: { agent: "agt_1" },
    },
    syncedAt: "2026-10-29T10:00:00.000Z",
};
const OWNED = [NUMBER];
const out = (value: Json) => value as Record<string, Json>;

Deno.test("agentline provision-numbers: persona then number, $3, seeded with the agent pointer", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#provision-numbers"),
        input: {
            body: {
                area_code: "415",
                agent: {
                    name: "Front Desk",
                    system_prompt: "You book tables.",
                    initial_greeting: "Hi, Front Desk here.",
                    voice_id: "female-1",
                },
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-provision-happy"),
        resources: [],
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, { default: 3 });
    const seed = result.resources?.provisions?.[0];
    assert(seed !== undefined, "expected a provision seed");
    assertEquals(seed.externalId, "num_1");
    assertEquals(seed.data, {
        phoneNumber: "+14155550100",
        country: "US",
        externalRefs: { agent: "agt_1" },
    });
    const output = out(result.output);
    assertEquals(output.balance_remaining, undefined);
    assertEquals(out(output.agent).voice_id, "female-1");
});

Deno.test("agentline provision-numbers: a refused buy deletes the persona and bills nothing", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#provision-numbers"),
        input: { body: { agent: { name: "Front Desk" } } },
        mode: "replay",
        fixture: await fixture("synthetic-provision-no-funds"),
        resources: [],
    });
    assertEquals(result.httpStatus, 402);
    assertEquals(result.usage.credits, {});
    assertEquals(result.resources?.provisions, undefined);
    assertEquals(
        out(result.output).message,
        "Insufficient balance: $3.00 required",
    );
});

Deno.test("agentline list-numbers: served from the ownership window only", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#list-numbers"),
        input: {},
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(result.output, {
        count: 1,
        numbers: [{
            id: "num_1",
            phone_number: "+14155550100",
            country: "US",
            synced_at: "2026-10-29T10:00:00.000Z",
        }],
    });
});

Deno.test("agentline get-numbers: the live number plus its persona; foreign ids 404", async () => {
    const unit = await testSealedUnit("agentline#get-numbers/{id}");
    const result = await runEndpoint({
        unit,
        input: { pathParams: { id: "num_1" } },
        mode: "replay",
        fixture: await fixture("synthetic-get-number"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    const output = out(result.output);
    assertEquals(output.phone_number, "+14155550100");
    assertEquals(output.agent, {
        name: "Front Desk",
        system_prompt: "You book tables.",
        initial_greeting: "Hi, Front Desk here.",
        voice_id: "female-1",
        voicemail_message: null,
    });
    const foreign = await runEndpoint({
        unit,
        input: { pathParams: { id: "num_other" } },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(foreign.httpStatus, 404);
});

Deno.test("agentline update-numbers: PATCHes the persona through the stored pointer", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#update-numbers/{id}"),
        input: {
            pathParams: { id: "num_1" },
            body: { voicemail_message: "Please call us back." },
        },
        mode: "replay",
        fixture: await fixture("synthetic-update-number"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(out(result.output).voicemail_message, "Please call us back.");
    assertEquals(out(result.output).account_id, undefined);
});

Deno.test("agentline release-numbers: a local ack and the RELEASES mark", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#release-numbers/{id}"),
        input: { pathParams: { id: "num_1" } },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 202);
    assertEquals(result.resources?.releases, [{
        resource: "agentline/phone-number",
        externalId: "num_1",
    }]);
});

Deno.test("agentline place-calls: the run is the call, billed max(60 s, duration) at $0.12/min", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#place-calls"),
        input: {
            body: { from_number_id: "num_1", to_number: "+12125557890" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-call-completed"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.evidence, { SECOND: 95 });
    assertEquals(out(result.output).status, "completed");
});

Deno.test("agentline place-calls: an unanswered call bills nothing; a foreign number never dials", async () => {
    const unit = await testSealedUnit("agentline#place-calls");
    const result = await runEndpoint({
        unit,
        input: {
            body: { from_number_id: "num_1", to_number: "+12125557890" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-call-no-answer"),
        resources: OWNED,
    });
    assertEquals(result.usage.evidence, { SECOND: 0 });
    const foreign = await runEndpoint({
        unit,
        input: {
            body: { from_number_id: "num_other", to_number: "+12125557890" },
        },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(foreign.httpStatus, 404);
    assertEquals(foreign.usage.credits, {});
});

Deno.test("agentline list-calls: scoped to the number's persona via agent_id", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#list-calls"),
        input: {
            queryParams: { number_id: "num_1", status: "completed", limit: 10 },
        },
        mode: "replay",
        fixture: await fixture("synthetic-list-calls"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(out(result.output).total, 1);
});

Deno.test("agentline history lists share one start fn", async () => {
    const starts = await Promise.all(
        ["list-calls", "list-messages", "list-conversations"].map(async (id) =>
            JSON.stringify(
                (await testSealedUnit(`agentline#${id}`)).doc.lifecycle?.start,
            )
        ),
    );
    assertEquals(new Set(starts).size, 1);
});

Deno.test("agentline call transcript: anchored on the call's persona, then fetched", async () => {
    const unit = await testSealedUnit("agentline#calls/{id}/transcript");
    const result = await runEndpoint({
        unit,
        input: {
            pathParams: { id: "call_1" },
            queryParams: { number_id: "num_1" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-call-transcript"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(out(result.output).call_id, "call_1");
});

Deno.test("agentline calls/{id}: another persona's call on the pooled account is a 404", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentline#calls/{id}"),
        input: {
            pathParams: { id: "call_9" },
            queryParams: { number_id: "num_1" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-foreign-call"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 404);
});

Deno.test("agentline phone-number resource: verify, refresh, release number then persona", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("agentline/phone-number"),
        mode: "replay",
        fixture: await fixture("synthetic-resource-ops"),
    });
    assertEquals(await resource.verify(NUMBER), { active: true });
    assertEquals(await resource.refresh(NUMBER), {
        active: true,
        patch: {
            country: "US",
            externalRefs: { agent: "agt_1" },
            phoneNumber: "+14155550100",
        },
    });
    assertEquals(await resource.release(NUMBER), { released: true });
});

Deno.test("agentline phone-number resource: a 409 on a still-active number retries", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("agentline/phone-number"),
        mode: "replay",
        fixture: await fixture("synthetic-release-busy"),
    });
    await assertRejects(() => resource.release(NUMBER));
});
