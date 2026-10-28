import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `naver_ai_overview` engine query parameters (https://serpapi.com/naver-ai-overview-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zNaverAiOverviewQuery = z.strictObject({
    query: z.string().describe(
        "The query you want to search. You can use anything that you would use in a regular Naver search to get the AI Briefing.",
    ).optional(),
    page_token: z.string().describe(
        "The token needed to retrieve the business AI Briefing. Use ai_briefing.page_token from our Naver Search API. page_token and query parameters can't be used together.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
