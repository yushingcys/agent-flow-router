import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_ai_overview` engine query parameters (https://serpapi.com/google-ai-overview-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleAiOverviewQuery = z.strictObject({
    page_token: z.string().min(1).describe(
        "The token to fetch the AI Overview from. Use ai_overview.page_token from the AI Overview Results section of our Google Search API — see the extra request example. ai_overview.page_token expires within 1 minute of the search and should be used immediately.",
    ),
    ...serpApiParams,
});
