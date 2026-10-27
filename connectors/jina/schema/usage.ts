import { Unit, UsageModelKind } from "@shared/core";

/** One PER_UNIT TOKEN line against Jina's single token pool. Declared on
 *  every endpoint as well as the provider so each typed `estimate` sees
 *  the `TOKEN` key. */
export const JINA_TOKEN_MODEL = {
    kind: UsageModelKind.PER_UNIT,
    unit: Unit.TOKEN,
    label: "tokens",
    description: "Jina tokens the request consumed",
    consumes: { credit: "default", amount: 1 },
} as const;
