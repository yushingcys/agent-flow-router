import { z } from "zod";

/** `GET /v1/products({filter})` (bestbuyapis.github.io/api-documentation,
 *  "Products API", read 2026-11-27). The filter is a PATH segment in the
 *  vendor's own query grammar; the rest are query parameters. Mirror
 *  carries optionality only (D25). */
export const zSearchProductsPathParams = z.strictObject({
    filter: z.string().min(1).describe(
        "Best Buy query expression inside products(...): attribute " +
            "comparisons joined by & (and) or | (or). Keyword search: " +
            "search=oven&search=stainless (& between words of a phrase). " +
            "One product: upc=190199246850, modelNumber=MQ8N3LL/A, " +
            "sku=6418599. Combine, e.g. search=airpods&salePrice<200.",
    ),
});

export const zSearchProductsQuery = z.strictObject({
    show: z.string().min(1).optional().describe(
        "Comma-separated attributes to return, e.g. " +
            "sku,name,modelNumber,upc,regularPrice,salePrice," +
            "onlineAvailability,inStoreAvailability,url. show=all " +
            "returns every attribute.",
    ),
    sort: z.string().min(1).optional().describe(
        "attribute.asc or attribute.desc, e.g. salePrice.asc; several " +
            "comma-separated.",
    ),
    pageSize: z.number().int().min(1).max(100).optional().describe(
        "Results per page, 1-100 (vendor default 10).",
    ),
    page: z.number().int().min(1).optional().describe(
        "Page number (default 1). Past 10 pages, walk with cursorMark.",
    ),
    cursorMark: z.string().min(1).optional().describe(
        "Deep-paging cursor: * for the first page, then the previous " +
            "response's nextCursorMark.",
    ),
    facets: z.string().min(1).optional().describe(
        "Attribute(s) to count values of across the matches, e.g. " +
            "manufacturer or manufacturer,10.",
    ),
});
