import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_news` engine query parameters (https://serpapi.com/google-news-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleNewsQuery = z.strictObject({
    q: z.string().describe(
        "The query you want to search. You can use anything that you would use in a regular Google News search. e.g. site:, when:. Parameter can't be used together with any of the Advanced Parameters.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google News search. It's a two-letter country code. (e.g., us for the United States (default), uk for United Kingdom, or fr for France).",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google News search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    topic_token: z.string().describe(
        'The Google News topic token. It is used for accessing the news results for a specific topic (e.g., "World", "Business", "Technology"). The token can be found in our JSON response or the URL of the Google News page (in the URL, it is a string of characters preceded by /topics/). Parameter can be used together with section_token.',
    ).optional(),
    kgmid: z.string().describe(
        'The Knowledge Graph ID (KGMID) of a topic or location for Google News results. It is a string that starts with /m/ or /g/. You can look up entities on Wikidata and use their "Freebase ID" as the kgmid. For example, /m/0vzm is the kgmid for Austin, TX, and /m/02mjmr is the kgmid for Barack Obama. Parameter can only be used alone.',
    ).optional(),
    publication_token: z.string().describe(
        'The Google News publication token. It is used for accessing the news results from a specific publisher (e.g., "CNN", "BBC", "The Guardian"). The token can be found in our JSON response or the URL of the Google News page (in the URL, it is a string of characters preceded by /publications/). Parameter can be used together with section_token.',
    ).optional(),
    section_token: z.string().describe(
        'The Google News section token. It is used for accessing the sub-section of a specific topic. (e.g., "Business -> Economy"). The token can be found in our JSON response or the URL of the Google News page (in the URL, it is a string of characters preceded by /sections/) Parameter can be used together with topic_token, publication_token, and so.',
    ).optional(),
    story_token: z.string().describe(
        "The Google News story token. It is used for accessing the news results with full coverage of a specific story. The token can be found in our JSON response or the URL of the Google News page (in the URL, it is a string of characters preceded by /stories/) Parameter can be used together with so.",
    ).optional(),
    so: z.string().describe(
        "The sorting method. Results can be sorted by relevance or by date. By default, the results are sorted by relevance. List of supported values are: 0 - Relevance 1 - Date Parameter can be used together with story_token and section_token.",
    ).optional(),
    ...serpApiParams,
});
