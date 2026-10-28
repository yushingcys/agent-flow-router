import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_gemini` engine query parameters (https://serpapi.com/google-gemini-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleGeminiQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The prompt you want to send to Google Gemini.",
    ),
    subsequent_request_token: z.string().describe(
        "The token used to continue a Google Gemini conversation. Pass this token with a new q to send a follow-up prompt that includes the previous prompts and answers as context (multi-turn). The token is returned by SerpApi from your previous request using our Google Gemini API. Gemini keeps a conversation only for a limited time, so the token expires: send the follow-up soon after the previous request.",
    ).optional(),
    ...serpApiParams,
});
