import { z } from "zod";

/** Query parameters shared by several V2 Data API routes
 *  (components.parameters in artificialanalysis.ai/api/v2/openapi, read
 *  2026-10-29). Mirror carries optionality only (D25). */

export const zPage = z.number().int().min(1).max(10000).describe(
    "Page number of a paginated list, 1-indexed (vendor default 1). The " +
        "response's `pagination.has_more` says whether another page exists.",
);

export const zPromptType = z.enum([
    "medium",
    "long",
    "100k",
    "vision_single_image",
    "medium_parallel",
]).describe(
    "Prompt preset behind the speed and latency figures: medium (1k input " +
        "tokens), long (10k, vendor default), 100k, vision_single_image " +
        "(1k plus one image), or medium_parallel (1k, 10 parallel queries).",
);
