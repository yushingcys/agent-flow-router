import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_scholar` engine query parameters (https://serpapi.com/google-scholar-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleScholarQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can also use helpers in your query such as: author:, or source:. Usage of cites parameter makes q optional. Usage of cites together with q triggers search within citing articles. Usage of cluster together with q and cites parameters is prohibited. Use cluster parameter only.",
    ),
    cites: z.string().describe(
        "Unique ID for an article to trigger Cited By searches. Usage of cites will bring up a list of citing documents in Google Scholar. Example value: cites=1275980731835430123. Usage of cites and q parameters triggers search within citing articles.",
    ).optional(),
    as_ylo: z.string().describe(
        "The year from which you want the results to be included. (e.g. if you set as_ylo parameter to the year 2018, the results before that year will be omitted.). This parameter can be combined with the as_yhi parameter.",
    ).optional(),
    as_yhi: z.string().describe(
        "The year until which you want the results to be included. (e.g. if you set as_yhi parameter to the year 2018, the results after that year will be omitted.). This parameter can be combined with the as_ylo parameter.",
    ).optional(),
    scisbd: z.string().describe(
        "Articles added in the last year, sorted by date. It can be set to 1 to include only abstracts, or 2 to include everything. The default value is 0 which means that the articles are sorted by relevance.",
    ).optional(),
    cluster: z.string().describe(
        "Unique ID for an article to trigger All Versions searches. Example value: cluster=1275980731835430123. Usage of cluster together with q and cites parameters is prohibited. Use cluster parameter only.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Scholar search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    lr: z.string().describe(
        "One or multiple languages to limit the search to. It uses lang_{two-letter language code} to specify languages and | as a delimiter. (e.g., lang_fr|lang_de will only search French and German pages).",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    num: z.number().describe(
        "The maximum number of results to return, ranging from 1 to 20, with a default of 10.",
    ).optional(),
    as_sdt: z.string().describe(
        "Parameter can be used either as a search type or a filter. As a Filter (only works when searching articles): 0 - exclude patents (default). 7 - include patents. As a Search Type: 4 - Select case law (US courts only). This will select all the State and Federal courts. e.g. as_sdt=4 - Selects case law (all courts) To select specific courts, see the full list of supported Google Scholar courts. e.g.",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content.",
    ).optional(),
    filter: z.string().describe(
        "If the filters for 'Similar Results' and 'Omitted Results' are on or off. It can be set to 1 (default) to enable these filters, or 0 to disable these filters.",
    ).optional(),
    as_vis: z.string().describe(
        "Whether you would like to include citations or not. It can be set to 1 to exclude these results, or 0 (default) to include them.",
    ).optional(),
    as_rr: z.string().describe(
        "Whether you would like to show only review articles or not (these articles consist of topic reviews, or discuss the works or authors you have searched for). It can be set to 1 to enable this filter, or 0 (default) to show all results.",
    ).optional(),
    ...serpApiParams,
});
