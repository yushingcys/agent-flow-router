import { z } from "zod";
import { serpApiParams, zLocation } from "../../../../schema/common.ts";

/** `brave_ai_mode` engine query parameters (https://serpapi.com/brave-ai-mode-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBraveAiModeQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search.",
    ),
    location: zLocation.optional(),
    lat: z.number().describe(
        "A GPS latitude for the search origin. Parameter is required when using lon parameter. Parameter can't be used with location parameter.",
    ).optional(),
    lon: z.number().describe(
        "A GPS longitude for the search origin. Parameter is required when using lat parameter. Parameter can't be used with location parameter.",
    ).optional(),
    country: z.string().describe(
        "The country to use for the Brave AI search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    language: z.string().describe(
        "The language to use for the Brave AI search. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French).",
    ).optional(),
    safeSearch: z.string().describe(
        "The level of filtering for adult content. It can be set to: off - Off moderate - Moderate strict - Strict",
    ).optional(),
    units_of_measurement: z.string().describe(
        "The units of measurement to use. It can be set to: metric - Metric us - Imperial (US)",
    ).optional(),
    subsequent_request_token: z.string().describe(
        "The token used to continue a Brave AI Mode conversation. Pass this token to send a follow-up question that includes the prior exchange as context (multi-turn). The token is returned by SerpApi from your previous request using our Brave AI Mode API. When using this token, include a new q for your follow-up prompt. For consistent behavior, reuse the same localization settings (gl, hl, and location)",
    ).optional(),
    ...serpApiParams,
});
