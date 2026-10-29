import { z } from "zod";
import { newsParams, zKeyword } from "../../../schema/news.ts";

export const zNewsQuery = z.strictObject({
    ...newsParams,
    keyword: zKeyword.optional(),
});
