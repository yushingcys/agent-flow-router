import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_patents` engine query parameters (https://serpapi.com/google-patents-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGooglePatentsQuery = z.strictObject({
    q: z.string().describe(
        "The query you want to search. You can split multiple search terms with semicolon ;. For advanced search syntax, please refer to About Google Patents. Example for single search term: (Coffee) OR (Tea) Example for multiple search terms (separated by semicolon ;): (Coffee) OR (Tea);(A47J)",
    ).optional(),
    page: z.number().describe(
        "The page number. It's used for pagination. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, etc.).",
    ).optional(),
    num: z.number().describe(
        "Parameter controls the number of results per page. Minimum: 10, Maximum: 100.",
    ).optional(),
    sort: z.string().describe(
        "The sorting method. By default, the results are sorted by Relevance. List of supported values are: new - Newest old - Oldest Patent results are sorted by filing_date while scholar results are sorted by publication_date for new and old values.",
    ).optional(),
    clustered: z.string().describe(
        "How the results should be grouped. List of supported values are: true - Classification",
    ).optional(),
    dups: z.string().describe(
        "The method of deduplication. Either Family (default) or Publication. List of supported values are: language - Publication",
    ).optional(),
    patents: z.string().describe(
        "Parameter controls whether or not to include Google Patents results. (Defaults to true)",
    ).optional(),
    scholar: z.string().describe(
        "Parameter controls whether or not to include Google Scholar results. (Defaults to false)",
    ).optional(),
    before: z.string().describe(
        "The maximum date of the results. The format of this field is type:YYYYMMDD. type can be one of priority, filing, and publication. Example: - priority:20221231 - publication:20230101",
    ).optional(),
    after: z.string().describe(
        "The minimum date of the results. The format of this field is type:YYYYMMDD. type can be one of priority, filing, and publication. Example: - priority:20221231 - publication:20230101",
    ).optional(),
    inventor: z.string().describe(
        "The inventors of the patents. Split multiple inventors with , (comma). Wrap names containing commas in parentheses, e.g. (Doe, John).",
    ).optional(),
    assignee: z.string().describe(
        "The assignees of the patents. Split multiple assignees with , (comma). Wrap names containing commas in parentheses, e.g. (Tesla, Inc).",
    ).optional(),
    country: z.string().describe(
        "Parameter filters patent results by countries. Split multiple country codes with , (comma). List of supported country codes. Example:WO,US.",
    ).optional(),
    language: z.string().describe(
        "Parameter filters patent results by languages. Split multiple languages with , (comma). List of supported values are: ENGLISH, GERMAN, CHINESE, FRENCH, SPANISH, ARABIC, JAPANESE, KOREAN, PORTUGUESE, RUSSIAN, ITALIAN, DUTCH, SWEDISH, FINNISH, NORWEGIAN, DANISH. Example:ENGLISH,GERMAN.",
    ).optional(),
    status: z.string().describe(
        "Parameter filters patent results by status. List of supported values are: GRANT - Grant APPLICATION - Application",
    ).optional(),
    type: z.string().describe(
        "Parameter filters patent results by type. List of supported values are: PATENT - Patent DESIGN - Design",
    ).optional(),
    litigation: z.string().describe(
        "Parameter filters patent results by litigation status. List of supported values are: YES - Has Related Litigation NO - No Known Litigation",
    ).optional(),
    ...serpApiParams,
});
