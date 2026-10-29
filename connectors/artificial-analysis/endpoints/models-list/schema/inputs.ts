import { z } from "zod";
import { zPage } from "../../../schema/common.ts";

/** `GET /language/models/free` query parameters. */
export const zModelsListQuery = z.strictObject({
    page: zPage.optional(),
});
