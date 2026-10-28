import { z } from "zod";
import { type AuthInjectFn, UsageModelKind } from "@shared/core";

const inject: AuthInjectFn = ({ data }) => data.request;

/** The keyless public API: no credential is asked for or sent, and calls
 *  are free. Spread into every `free/...` endpoint. */
export const freeApi = {
    auth: { credentials: z.object({}), inject },
    usage: { model: { kind: UsageModelKind.FREE } },
} as const;
