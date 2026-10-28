import { Unit, UsageModelKind } from "@shared/core";

/** Every Topaz endpoint bills one line: the credits Topaz reports for the
 *  completed job, one pool credit each. Declared per endpoint (the typed
 *  estimate keys its counts off the endpoint's own model). */
export const creditModel = {
    kind: UsageModelKind.PER_UNIT,
    unit: Unit.CREDIT,
    label: "Topaz credits",
    description: "credits Topaz bills for the completed job",
    consumes: { credit: "default", amount: 1 },
} as const;
