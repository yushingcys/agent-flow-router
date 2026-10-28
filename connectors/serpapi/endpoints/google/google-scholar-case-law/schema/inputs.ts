import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_scholar_case_law` engine query parameters (https://serpapi.com/google-scholar-case-law-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleScholarCaseLawQuery = z.strictObject({
    case_id: z.string().min(1).describe(
        "The ID of the case you want to scrape. You can find case law case_id in Google Scholar API results. Please head to the Google Scholar API documentation to learn how to use the as_sdt parameter to get case law results using Google Scholar API.",
    ),
    ...serpApiParams,
});
