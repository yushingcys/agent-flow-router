import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_related_questions` engine query parameters (https://serpapi.com/google-related-questions-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleRelatedQuestionsQuery = z.strictObject({
    next_page_token: z.string().min(1).describe(
        "The token needed to show the additional related questions that Google generates when a specific question gets clicked. This token can be found in the Related Questions block returned in a regular Google Search API response.",
    ),
    ...serpApiParams,
});
