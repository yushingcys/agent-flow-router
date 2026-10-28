import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `duck_ai` engine query parameters (https://serpapi.com/duck-ai-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zDuckduckgoAiChatQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The prompt you want to send to Duck AI, DuckDuckGo's AI chat.",
    ),
    model: z.string().describe(
        "The AI model that answers the prompt. It can be set to: gpt-5.6-luna - GPT-5.6 Luna gpt-6-luna - GPT-6 Luna gpt-5.4-mini - GPT-5.4 mini claude-haiku-4-5 - Claude Haiku 4.5 mistral-small-2603 - Mistral Small 4 tinfoil/gpt-oss-120b - gpt-oss 120B tinfoil/gemma4-31b - Gemma 4 31B It defaults to gpt-5.6-luna.",
    ).optional(),
    subsequent_request_token: z.string().describe(
        "The token used to continue a Duck AI conversation. Pass this token with a new q to send a follow-up prompt that includes the previous prompts and answers as context (multi-turn). The token is returned by SerpApi from your previous request using our Duck AI API. The token holds the whole conversation, so it grows with each turn. Conversations longer than about 16,000 characters (prompts and answers combined)",
    ).optional(),
    ...serpApiParams,
});
