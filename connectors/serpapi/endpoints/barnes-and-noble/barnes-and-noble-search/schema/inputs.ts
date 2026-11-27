import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `barnes_and_noble` engine query parameters (https://serpapi.com/barnes-and-noble-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zBarnesAndNobleSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Barnes & Noble search: a title, an author, a keyword, or an ISBN (e.g., agatha christie, The Hobbit, or 9780441013593).",
    ),
    sort_by: z.string().describe(
        "Sorting order. It defaults to Top Matches. Available options: bestsellers, newest, oldest, price_low_to_high, price_high_to_low, title.",
    ).optional(),
    availability: z.string().describe(
        "Availability filter. Options can be separated by || (e.g., in_stock||pre_order). Available options: in_stock, pre_order.",
    ).optional(),
    department: z.string().describe(
        "Department filter (e.g., Books, eBooks & NOOK). Multiple departments can be separated by ||. Values come from filters in the response.",
    ).optional(),
    subject: z.string().describe(
        "Subject filter (e.g., Mystery & Thrillers). Multiple subjects can be separated by ||.",
    ).optional(),
    product_format: z.string().describe(
        "Format filter (e.g., Hardcover, Paperback, eBook). Multiple formats can be separated by ||.",
    ).optional(),
    age: z.string().describe(
        "Age-range filter (e.g., 0 - 2 Years, Teens). Multiple ranges can be separated by ||.",
    ).optional(),
    price: z.string().describe(
        "Price-range filter (e.g., Under $5, $10 - $15, Over $50). Multiple ranges can be separated by ||.",
    ).optional(),
    rating: z.number().describe(
        "Minimum average rating, from 1 to 5 stars (e.g., 4 for products rated 4 stars and up).",
    ).optional(),
    language: z.string().describe(
        "Language filter (e.g., English or Spanish). Multiple languages can be separated by ||.",
    ).optional(),
    color: z.string().describe(
        "Color filter (e.g., Black). Multiple colors can be separated by ||.",
    ).optional(),
    next_page_token: z.string().describe(
        "Next page token from serpapi_pagination.next_page_token. Leave unset for the first page. Barnes & Noble returns up to 24 results per page. The token expires 15 minutes after the search it comes from.",
    ).optional(),
    ...serpApiParams,
});
