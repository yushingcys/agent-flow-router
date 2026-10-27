import { z } from "zod";
import {
    zBraveCountry,
    zBraveQ,
    zBraveSearchLang,
    zBraveSpellcheck,
} from "../../../schema/common.ts";

/** GET /res/v1/images/search query params (API reference, 2026-10-23).
 *  Not paginated: no `offset`. */
export const zBraveImageSearchQuery = z.object({
    q: zBraveQ(400, 50),
    country: zBraveCountry.optional(),
    search_lang: zBraveSearchLang.optional(),
    count: z.number().int().min(1).max(200).describe(
        "Number of images, 1-200 (vendor default 50). Image search has " +
            "no pagination; raise count for more.",
    ).optional(),
    safesearch: z.enum(["off", "strict"]).describe(
        "Adult-content filter: off or strict (vendor default).",
    ).optional(),
    spellcheck: zBraveSpellcheck.optional(),
}).strict();
