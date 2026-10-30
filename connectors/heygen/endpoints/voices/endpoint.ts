import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";

/**
 * `GET /v3/models/audio/voices?type=public` - HeyGen's public voices,
 * newest first. `type` is pinned to `public`: the pooled workspace's
 * private list would show every tenant's clones.
 */
export default defineEndpoint({
    meta: {
        displayName: "HeyGen Public Voices",
        summary: "List HeyGen's public voices for text-to-speech.",
        description: "Page through the voices HeyGen provides to every " +
            "workspace, newest first. Each voice has a `voice_id` for " +
            "/text-to-speech and /speech-to-speech, a `name` describing " +
            "its character, its `language`, `status`, and a " +
            "`preview_audio_url` to listen to it. Page with `limit` and " +
            "the response's `next_token` (pass it back as `token`) while " +
            "`has_more` is true.",
        docsUrl: "https://developers.heygen.com/reference/list-audio-voices",
        categories: ["speech"],
    },
    endpoint: "/voices",
    request: { method: "GET", path: "/v3/models/audio/voices" },
    input: {
        schema: {
            queryParams: z.object({
                limit: z.number().int().min(1).max(100).describe(
                    "Voices per page, 1-100. HeyGen defaults to 10.",
                ).optional(),
                token: z.string().describe(
                    "The `next_token` of the previous page.",
                ).optional(),
            }).strict(),
        },
        toRequest: ({ data }) => ({
            ...data.input,
            queryParams: { ...data.input.queryParams, type: "public" },
        }),
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
