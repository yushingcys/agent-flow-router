import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `bing_copilot` engine query parameters (https://serpapi.com/bing-copilot-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingCopilotQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query for Bing Copilot. You can use anything that you would use in a regular Bing Copilot search.",
    ),
    ...serpApiParams,
});
