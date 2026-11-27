import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zWholeFoodsProductQuery } from "./schema/inputs.ts";

/** GET /wholefoods/product — Get Whole Foods Product. */
export default defineEndpoint({
    meta: {
        displayName: "Get Whole Foods Product",
        summary: "Get one public Whole Foods product's price and availability.",
        description:
            "Unofficial scraper of a public Whole Foods product page (not an official Whole Foods API). Pass the product page URL from a Whole Foods search, and optionally a store_id. Returns the product's price and availability. Whole Foods' terms of service may prohibit scraping, and this Alpha endpoint can break when the site changes.",
        docsUrl: "https://litescrape.com/docs/wholefoods-product",
        categories: ["whole-foods"],
        notes: [
            "Alpha upstream (litescrape.com/docs/wholefoods-product, read 2026-11-27): unofficial third-party results, not an official Whole Foods API. Result groups and field availability may change.",
        ],
    },
    request: { method: "GET", path: "/wholefoods/product" },
    input: {
        schema: {
            queryParams: zWholeFoodsProductQuery,
        },
    },
    usage: {
        /** One Litescrape credit per call that returned a result group —
         *  the flat card cited in provider.ts (design D2), counted 0|1 by
         *  the evidence below (design D3). */
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "calls with results",
            description: "calls whose response carried a result group",
            consumes: { credit: "default", amount: 1 },
        },
        // estimate is inherited: the provider promises one call
        /** Result group `product` (litescrape.com docs, read 2026-11-27):
         *  1 when that group is a non-empty array, string, or object, or a
         *  non-null scalar; 0 for an empty success. The vendor still
         *  deducts the credit; this card records 0. */
        evidence: ({ data }) => {
            const groups = [
                "product",
            ];
            const body = data.output;
            let hit = 0;
            if (
                typeof body === "object" && body !== null &&
                !Array.isArray(body)
            ) {
                for (const key of groups) {
                    const value = (body as Record<string, unknown>)[key];
                    if (value === null || value === undefined) continue;
                    if (Array.isArray(value)) {
                        if (value.length > 0) hit = 1;
                        continue;
                    }
                    if (typeof value === "string") {
                        if (value.length > 0) hit = 1;
                        continue;
                    }
                    if (typeof value === "object") {
                        if (Object.keys(value).length > 0) hit = 1;
                        continue;
                    }
                    hit = 1;
                }
            }
            return { counts: { RESULT: hit } };
        },
    },
});
