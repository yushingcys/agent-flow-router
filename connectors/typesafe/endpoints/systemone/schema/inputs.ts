import { z } from "zod";

/**
 * `POST https://api.typesafe.ai/v1/systemone` body - `SystemOneRequest`
 * (api.typesafe.ai/openapi.json v0.2.0, read 2026-10-29), text mode only:
 * `assets` and the `box` question type need the
 * `TypeSafe-Danger-Zone-Images` request header, which a doc cannot set
 * per call, so neither is exposed. Mirror carries optionality only (D25).
 */

/** The vendor's `x-accepts: string | object | array` content value. */
const zContent = z.union([
    z.string(),
    z.record(z.string(), z.json()),
    z.array(z.json()),
]);

const zInstructions = zContent.describe(
    "The question to answer about the state: plain text, or a JSON " +
        "object or array for structured instructions.",
);

const zNoul = z.strictObject({
    type: z.literal("noul").describe(
        "Yes/no question or statement, answered with the probability of " +
            "yes (true).",
    ),
    instructions: zInstructions.optional(),
    criteria: z.strictObject({
        true: zContent.describe("What counts as a yes answer.").optional(),
        false: zContent.describe("What counts as a no answer.").optional(),
    }).describe("Criteria clarifying what counts as yes or no.").optional(),
});

const zChoice = z.strictObject({
    type: z.literal("choice").describe(
        "Select one option, answered with the option, a probability per " +
            "option, and confidence.",
    ),
    instructions: zInstructions.optional(),
    criteria: z.record(z.string(), zContent.nullable()).describe(
        "1-255 choice names mapped to a description of when each applies " +
            "(null = interpreted by its name alone).",
    ),
});

const zScore = z.strictObject({
    type: z.literal("score").describe(
        "Rate against ordered levels, answered with the probability-" +
            "weighted score, a probability per level, and confidence.",
    ),
    instructions: zInstructions.optional(),
    criteria: z.array(zContent).min(1).max(10).describe(
        "Ordered descriptions of the score levels; position is the score, " +
            "starting at 0.",
    ),
});

export const zSystemOneBody = z.strictObject({
    model: z.string().describe(
        "Model name or alias: jev-latest (current stable), jev-preview " +
            "(newest, including previews), or a pinned version such as " +
            "jev-1.14.0 or jev-1.13.0. The response names the version that " +
            "answered.",
    ),
    state: zContent.describe(
        "The content every question refers to: text, or a JSON object or " +
            "array (a ticket, a record pair, a chat log).",
    ),
    questions: z.record(
        z.string(),
        z.discriminatedUnion("type", [zNoul, zChoice, zScore]),
    ).describe(
        "At least one question, keyed by a name you choose; answers come " +
            "back under the same names.",
    ),
});
