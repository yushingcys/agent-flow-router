import { z } from "zod";
import { newsParams, zKeyword } from "../../../schema/news.ts";

export const zNewsByKeywordQuery = z.strictObject({
    ...newsParams,
    keyword: zKeyword,
});
