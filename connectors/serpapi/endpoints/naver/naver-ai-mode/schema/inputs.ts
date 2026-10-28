import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `naver_ai_mode` engine query parameters (https://serpapi.com/naver-ai-mode-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zNaverAiModeQuery = z.strictObject({
    query: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Naver AI Mode search.",
    ),
    continuable: z.boolean().describe(
        "Set parameter to true to make the conversation continuable. It defaults to false. When set to true, SerpApi will return a subsequent_request_token in the response which can be used to continue the conversation with a follow-up question that includes the prior exchange as context (multi-turn).",
    ).optional(),
    subsequent_request_token: z.string().describe(
        "The token used to continue a Naver AI Mode conversation. Pass this token to send a follow-up question that includes the prior exchange as context (multi-turn). The token is returned by SerpApi from your previous request using our Naver AI Mode API. When using this token, include a new query for your follow-up prompt.",
    ).optional(),
    ...serpApiParams,
});
