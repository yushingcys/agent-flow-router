import { z } from "zod";
import { zPromptType } from "../../../schema/common.ts";

/** `GET /language/models/{slug}` parameters. */
export const zModelDetailPath = z.strictObject({
    slug: z.string().min(1).describe(
        "Model slug as returned by artificial-analysis#get_models_list, " +
            "e.g. gemini-3-pro, claude-opus-4-6, deepseek-v3.",
    ),
});

export const zModelDetailQuery = z.strictObject({
    prompt_type: zPromptType.optional(),
});
