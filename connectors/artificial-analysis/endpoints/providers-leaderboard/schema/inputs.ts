import { z } from "zod";
import { zPage } from "../../../schema/common.ts";

/** `GET /language/providers` query parameters. */
export const zProvidersQuery = z.strictObject({
    page: zPage.optional(),
});
