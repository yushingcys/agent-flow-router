import { z } from "zod";

/**
 * The AgentLine input mirrors shared across endpoints (OpenAPI
 * api.agentline.cloud/openapi.json, 0.3.0, read 2026-10-29). Optionality
 * only, no defaults.
 */

export const zNumberId = z.string().min(1).describe(
    "The id of a phone number YOU OWN (`num_...`, from /provision-numbers " +
        "or /list-numbers) - not the phone number itself.",
);

export const zCallId = z.string().min(1).describe(
    "The call id (`call_...`, from /place-calls or /list-calls).",
);

export const zE164 = z.string().regex(/^\+[1-9]\d{6,14}$/).describe(
    'Phone number in E.164 format, e.g. "+12125551234".',
);

/** The persona (AgentLine "agent") fields a number's AI voice runs on. */
export const zPersonaFields = {
    system_prompt: z.string().min(1).describe(
        "Instructions for the AI voice on ALL calls, inbound and outbound.",
    ).optional(),
    initial_greeting: z.string().min(1).describe(
        "Opening line spoken when a call connects.",
    ).optional(),
    voice_id: z.string().min(1).describe(
        "A voice preset name (e.g. female-1, male-2) or voice_id from " +
            "/list-voices.",
    ).optional(),
    voicemail_message: z.string().min(1).describe(
        "Message left when an outbound call reaches voicemail. Without it " +
            "the voice hangs up on a mailbox.",
    ).optional(),
};

/** Query params of every number-scoped history read. */
export const zNumberQuery = {
    number_id: zNumberId,
};

/** Offset paging the history lists take. */
export const zPaging = {
    limit: z.number().int().min(1).max(200).describe(
        "Page size, newest first (default 50).",
    ).optional(),
    offset: z.number().int().min(0).describe(
        "How many items to skip (default 0).",
    ).optional(),
};
