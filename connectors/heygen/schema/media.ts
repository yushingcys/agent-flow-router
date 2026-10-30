import { z } from "zod";

/**
 * HeyGen's media reference, narrowed to its `{type: "url", url}` form.
 * `asset_id` would name a file in the pooled workspace and base64 would
 * bloat the run record, so neither is accepted. `.regex()` compiles to a
 * JSON Schema `pattern` the engine enforces.
 */
export function zUrlMedia(what: string) {
    return z.object({
        type: z.literal("url"),
        url: z.string()
            .regex(/^https:\/\/\S+$/, "must be a public https:// URL")
            .describe(
                `Public https:// URL of the ${what}; HeyGen fetches it ` +
                    "server-side and does not follow redirects.",
            ),
    }).strict();
}
