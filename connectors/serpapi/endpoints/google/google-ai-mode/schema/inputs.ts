import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_ai_mode` engine query parameters (https://serpapi.com/google-ai-mode-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleAiModeQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google AI Mode search. Google AI Mode may support multiple languages (including English), though not all are available yet.",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    continuable: z.boolean().describe(
        "Set parameter to true to make the conversation continuable. It defaults to false. When set to true, SerpApi will return a subsequent_request_token in the response which can be used to continue the conversation with a follow-up question that includes the prior exchange as context (multi-turn).",
    ).optional(),
    subsequent_request_token: z.string().describe(
        "The token used to continue a Google AI Mode conversation. Pass this token to send a follow-up question that includes the prior exchange as context (multi-turn). The token is returned by SerpApi from your previous request using our Google AI Mode API. When using this token, include a new q for your follow-up prompt. For consistent behavior, reuse the same localization settings (gl, hl, and location)",
    ).optional(),
    image_url: z.string().describe(
        "The URL of an image to include in the prompt. The image will be used as additional context for the AI to generate a response.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
