import { assert, assertEquals } from "@std/assert";
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
 * The agentmail suite. Chains are SYNTHETIC, built from the documented
 * OpenAPI shapes (docs.agentmail.to/openapi.json, read 2026-10-27).
 * Ownership is the fixture's story: `resources` seeds the reader, and a
 * foreign id proves the uniform 404 with zero upstream calls.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const fixture = (name: string) => loadFixture(`${HERE}fixtures/${name}.json`);

const INBOX: OwnedResource = {
    resource: "agentmail/inbox",
    externalId: "agent@agentmail.to",
    data: { email: "agent@agentmail.to" },
    syncedAt: "2026-10-27T00:00:00.000Z",
};
const DOMAIN: OwnedResource = {
    resource: "agentmail/domain",
    externalId: "dom-1",
    data: { domain: "example.com", status: "VERIFIED" },
};
const OWNED = [INBOX, DOMAIN];

Deno.test("agentmail create-inboxes: provisions the inbox at $1, pooled ids stripped", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentmail#create-inboxes"),
        input: { body: { username: "agent", display_name: "Agent" } },
        mode: "replay",
        fixture: await fixture("synthetic-create-inbox"),
        resources: [],
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, { default: 1 });
    const seed = result.resources?.provisions?.[0];
    assert(seed !== undefined, "expected a provision seed");
    assertEquals(seed.resource, "agentmail/inbox");
    assertEquals(seed.externalId, "agent@agentmail.to");
    assertEquals(seed.data, {
        email: "agent@agentmail.to",
        display_name: "Agent",
    });
    assertEquals((result.output as Record<string, Json>).pod_id, undefined);
});

Deno.test("agentmail create-inboxes: a subdomain of an owned domain passes the check", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentmail#create-inboxes"),
        input: { body: { domain: "Mail.Example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-create-inbox"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
});

Deno.test("agentmail create-inboxes: a domain this workspace does not own is a 404, never sent", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentmail#create-inboxes"),
        input: { body: { domain: "notexample.com" } },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 404);
    assertEquals(result.usage.credits, {});
    assertEquals(result.resources?.provisions, undefined);
});

Deno.test("agentmail list-inboxes / list-domains: served from the ownership window only", async () => {
    const inboxes = await runEndpoint({
        unit: await testSealedUnit("agentmail#list-inboxes"),
        input: {},
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(inboxes.output, {
        count: 1,
        inboxes: [{
            inbox_id: "agent@agentmail.to",
            email: "agent@agentmail.to",
            synced_at: "2026-10-27T00:00:00.000Z",
        }],
    });
    const domains = await runEndpoint({
        unit: await testSealedUnit("agentmail#list-domains"),
        input: {},
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(domains.output, {
        count: 1,
        domains: [{
            domain_id: "dom-1",
            domain: "example.com",
            status: "VERIFIED",
        }],
    });
});

Deno.test("agentmail send-messages: gated relay at $0.001", async () => {
    const unit = await testSealedUnit("agentmail#send-messages");
    const input = {
        pathParams: { inbox_id: "agent@agentmail.to" },
        body: { to: "sales@example.com", subject: "Hi", text: "Hello" },
    };
    const sent = await runEndpoint({
        unit,
        input,
        mode: "replay",
        fixture: await fixture("synthetic-send-message"),
        resources: OWNED,
    });
    assertEquals(sent.httpStatus, 200);
    assertEquals(sent.usage.credits, { default: 0.001 });
    assertEquals(
        (sent.output as Record<string, Json>).thread_id,
        "th-1",
    );
    // a foreign inbox: the uniform 404, zero usage, upstream untouched
    const foreign = await runEndpoint({
        unit,
        input: { ...input, pathParams: { inbox_id: "other@agentmail.to" } },
        mode: "replay",
        resources: OWNED,
    });
    assertEquals(foreign.httpStatus, 404);
    assertEquals(foreign.usage.credits, {});
});

Deno.test("agentmail send-messages: a vendor error is data, zero-billed, message lifted", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentmail#send-messages"),
        input: {
            pathParams: { inbox_id: "agent@agentmail.to" },
            body: { to: "blocked@example.com", text: "Hello" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage.credits, {});
    assertEquals(
        (result.output as Record<string, Json>).message,
        "Sending to this recipient is blocked.",
    );
});

Deno.test("agentmail messages/{id}: address and angle-bracket ids are percent-encoded", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentmail#messages/{id}"),
        input: {
            pathParams: {
                inbox_id: "agent@agentmail.to",
                id: "<m1@mail.example.com>",
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-get-message"),
        resources: OWNED,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, {});
    assertEquals((result.output as Record<string, Json>).subject, "Pricing");
});

Deno.test("agentmail release-inboxes / release-domains: delete upstream + the RELEASES mark", async () => {
    const inbox = await runEndpoint({
        unit: await testSealedUnit("agentmail#release-inboxes/{id}"),
        input: { pathParams: { id: "agent@agentmail.to" } },
        mode: "replay",
        fixture: await fixture("synthetic-release-inbox"),
        resources: OWNED,
    });
    assertEquals(inbox.httpStatus, 200);
    assertEquals(inbox.resources?.releases, [{
        resource: "agentmail/inbox",
        externalId: "agent@agentmail.to",
    }]);
    const domain = await runEndpoint({
        unit: await testSealedUnit("agentmail#release-domains/{id}"),
        input: { pathParams: { id: "dom-1" } },
        mode: "replay",
        fixture: await fixture("synthetic-release-domain"),
        resources: OWNED,
    });
    assertEquals(domain.resources?.releases, [{
        resource: "agentmail/domain",
        externalId: "dom-1",
    }]);
});

Deno.test("agentmail create-domains: provisions the domain at $1", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("agentmail#create-domains"),
        input: { body: { domain: "example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-create-domain"),
        resources: [],
    });
    assertEquals(result.usage.credits, { default: 1 });
    const seed = result.resources?.provisions?.[0];
    assert(seed !== undefined, "expected a provision seed");
    assertEquals(seed.externalId, "dom-1");
    assertEquals(seed.data, { domain: "example.com", status: "NOT_STARTED" });
});

Deno.test("agentmail inbox resource: verify, refresh, then an idempotent release", async () => {
    const resource = await loadResource({
        unit: await testResourceUnit("agentmail/inbox"),
        mode: "replay",
        fixture: await fixture("synthetic-resource-ops"),
    });
    assertEquals(await resource.verify(INBOX), { active: true });
    assertEquals(await resource.refresh(INBOX), {
        active: true,
        patch: { email: "agent@agentmail.to", display_name: "Sales Agent" },
    });
    // /release-inboxes already deleted it: 404 is done, not a failure
    assertEquals(await resource.release(INBOX), { released: true });
});
