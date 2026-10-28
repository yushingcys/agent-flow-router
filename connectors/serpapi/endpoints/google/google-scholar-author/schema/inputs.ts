import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_scholar_author` engine query parameters (https://serpapi.com/google-scholar-author-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleScholarAuthorQuery = z.strictObject({
    author_id: z.string().min(1).describe(
        "The ID of an author. You can find the ID either by using our Google Scholar Profiles API or by going to the Google Scholar user profile page and getting it from there (e.g., https://scholar.google.com/citations?user={author_id}).",
    ),
    hl: z.string().describe(
        "The language to use for the Google Scholar Author search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    view_op: z.string().describe(
        "Viewing specific parts of a page. It has two options: view_citation - Select to view citations. citation_id is required. list_colleagues - Select to view all co-authors",
    ).optional(),
    sort: z.string().describe(
        'Sorting and refining articles. Available options: title - Sorts articles by "Title". pubdate - Sorts articles by publish "date". By default, articles are sorted by the number of citations.',
    ).optional(),
    citation_id: z.string().describe(
        "Retrieving individual article citation. It is a required parameter when view_op=view_citation is selected. You can access IDs inside our structured JSON response.",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 20 is the 2nd page of results, 40 is the 3rd page of results, etc.).",
    ).optional(),
    num: z.number().describe(
        "The number of results to return. (e.g., 20 (default) returns 20 results, 40 returns 40 results, etc.). Maximum number of results to return is 100.",
    ).optional(),
    ...serpApiParams,
});
