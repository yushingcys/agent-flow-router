import { z } from "zod";

/**
 * The AgentMail input mirrors shared across endpoints (OpenAPI
 * `components.schemas`, read 2026-10-27). Optionality only, no defaults.
 */

export const zInboxId = z.string().min(1).describe(
    "The id of an inbox YOU OWN - its email address, e.g. " +
        '"agent@agentmail.to" (from /create-inboxes or /list-inboxes).',
);

/** Path params of every inbox-scoped list/send route. */
export const zInboxPath = z.object({ inbox_id: zInboxId }).strict();

/** `{id}` names the thing the endpoint acts on, inside an owned inbox. */
export const inboxItemPath = (what: string) =>
    z.object({
        inbox_id: zInboxId,
        id: z.string().min(1).describe(`The ${what} id.`),
    }).strict();

export const inboxAttachmentPath = (what: string) =>
    z.object({
        inbox_id: zInboxId,
        id: z.string().min(1).describe(`The ${what} id.`),
        attachment_id: z.string().min(1).describe(
            `The attachment id, from the ${what}'s \`attachments\`.`,
        ),
    }).strict();

/** `messages_Addresses`: one address or a list. */
const zAddresses = z.union([z.string(), z.array(z.string())]);

export const zLabels = z.array(z.string());
/** `messages_UpdateMessageLabels`: one label or a list. */
export const zLabelOrLabels = z.union([z.string(), z.array(z.string())]);

/** `attachments_SendAttachment`: provide either `content` or `url`. */
export const zSendAttachment = z.object({
    filename: z.string().optional(),
    content_type: z.string().optional(),
    content_disposition: z.enum(["inline", "attachment"]).optional(),
    content_id: z.string().optional(),
    content: z.string().optional().describe(
        "Base64 content. The whole request is limited to 6 MB.",
    ),
    url: z.string().optional().describe(
        "A URL AgentMail can download without auth (about 30 MB total).",
    ),
}).strict();

/** The outbound-message fields send / reply / forward share. */
export const zOutboundFields = {
    labels: zLabels.optional(),
    reply_to: zAddresses.optional(),
    to: zAddresses.optional().describe(
        '"user@domain.com" or "Display Name <user@domain.com>", or a list.',
    ),
    cc: zAddresses.optional(),
    bcc: zAddresses.optional(),
    text: z.string().optional().describe("Plain text body."),
    html: z.string().optional().describe("HTML body."),
    attachments: z.array(zSendAttachment).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    track_opens: z.boolean().optional().describe(
        "Track the first open. Needs a custom domain with tracking enabled.",
    ),
};

/** Cursor paging every list route takes. */
export const zPaging = {
    limit: z.number().int().min(1).optional(),
    page_token: z.string().optional().describe(
        "The previous page's `next_page_token`.",
    ),
};

/** Time-window filters on list/search routes (ISO 8601). */
export const zWindow = {
    before: z.string().optional().describe("Only items before this time."),
    after: z.string().optional().describe("Only items after this time."),
};

/** Allow/block list coordinates. */
export const zListCoords = {
    direction: z.enum(["send", "receive", "reply"]).describe(
        "Which mail the list governs: send, receive, or reply.",
    ),
    type: z.enum(["allow", "block"]).describe("Allow list or block list."),
};

export const zDomainId = z.string().min(1).describe(
    "The id of a domain YOU OWN (`domain_id` from /create-domains or " +
        "/list-domains).",
);
