import { z } from "zod";
import { zTimeoutOpts, zZdr } from "../../../schema/common.ts";

/** POST /web/answers body - the vendor mirror
 *  (docs.context.dev/api-reference/web-extraction/answers, 2026-10-27).
 *  `tags` is not carried. */
export const zAnswersBody = z.object({
    task: z.string().min(1).max(2000).describe(
        "Research task. The agent picks company or profile lookups, web " +
            "searches, and page reads; include domains or URLs to focus the " +
            "research.",
    ),
    mode: z.enum(["fast", "ultra"]).describe(
        "'fast' (10 credits) suits short factual tasks, with extra " +
            "verification for people and companies; 'ultra' (100 credits, " +
            "the default) researches deeper.",
    ).optional(),
    json_format: z.record(z.string(), z.any()).describe(
        "An EXAMPLE answer object (not a JSON Schema) giving the shape of " +
            "json_content; up to 8 levels, 500 values, and 16000 characters. " +
            "Unknown values may come back null.",
    ).optional(),
    timeoutOpts: zTimeoutOpts.optional(),
    zdr: zZdr.optional(),
}).strict();
