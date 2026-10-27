import { z } from "zod";
import { zFilterFields } from "../../../schema/filters.ts";

/**
 * Perplexity POST /v1/agent request body (`ResponsesRequest`, OpenAPI
 * mirror), the subset this endpoint offers: text input, one model, the
 * web_search and fetch_url tools. Optionality only (D25).
 */

const zText = z.strictObject({
    type: z.literal("input_text"),
    text: z.string(),
});

const zMessage = z.strictObject({
    type: z.literal("message"),
    role: z.enum(["user", "assistant", "system", "developer"]),
    content: z.union([z.string(), z.array(zText)]),
});

const zWebSearchTool = z.strictObject({
    type: z.literal("web_search"),
    search_type: z.enum(["web", "fast"]).describe(
        "web = standard search ($2.50 per 1,000 invocations), fast = " +
            "Fast Search ($1.00 per 1,000). Defaults to web.",
    ).optional(),
    max_results: z.number().int().min(1).max(50).describe(
        "Upper bound on results collected per search call.",
    ).optional(),
    max_tokens: z.number().int().min(1).describe(
        "Maximum total search-context tokens per call.",
    ).optional(),
    max_tokens_per_page: z.number().int().min(1).describe(
        "Maximum tokens extracted from each result page.",
    ).optional(),
    filters: z.strictObject(zFilterFields).optional(),
    user_location: z.strictObject({
        city: z.string().optional(),
        region: z.string().optional(),
        country: z.string().describe("ISO 3166-1 alpha-2 country code.")
            .optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),
});

const zFetchUrlTool = z.strictObject({
    type: z.literal("fetch_url"),
    max_urls: z.number().int().min(1).max(10).describe(
        "Maximum URLs fetched per tool call.",
    ).optional(),
});

export const zAgentBody = z.strictObject({
    input: z.union([z.string().min(1), z.array(zMessage).min(1)]).describe(
        "The question as a string, or a conversation as message items " +
            "({type: 'message', role, content}).",
    ),
    instructions: z.string().describe("System instructions for the model.")
        .optional(),
    model: z.string().describe("Model id in provider/model form.")
        .optional(),
    max_output_tokens: z.number().int().min(1).describe(
        "Maximum tokens the model may generate.",
    ).optional(),
    max_steps: z.number().int().min(1).max(100).describe(
        "Maximum research-loop steps (each step may call tools). " +
            "Defaults to 1.",
    ).optional(),
    tools: z.array(z.discriminatedUnion("type", [
        zWebSearchTool,
        zFetchUrlTool,
    ])).describe(
        "Tools the model may call. Web search is opt-in: without a " +
            "web_search tool the answer comes from the model alone, with " +
            "no citations.",
    ).optional(),
    tool_choice: z.enum(["none", "auto", "required"]).optional(),
    language_preference: z.string().describe(
        "ISO 639-1 code for the response language.",
    ).optional(),
    response_format: z.strictObject({
        type: z.literal("json_schema"),
        json_schema: z.strictObject({
            name: z.string().min(1).max(64),
            schema: z.record(z.string(), z.any()).describe(
                "The JSON schema the answer must match.",
            ),
            description: z.string().optional(),
            strict: z.boolean().optional(),
        }),
    }).describe("Structured output: the answer is JSON matching schema.")
        .optional(),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
});
