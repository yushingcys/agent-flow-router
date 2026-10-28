import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleAdsTransparencyQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_ads_transparency_center */
export default defineEndpoint({
    meta: {
        displayName: "Look Up Advertiser Creatives",
        summary:
            "List an advertiser's ad creatives from the Google Ads Transparency Center.",
        description:
            "List an advertiser's ad creatives from the Google Ads Transparency Center. Runs SerpApi's `google_ads_transparency_center` engine.",
        docsUrl: "https://serpapi.com/google-ads-transparency-center-api",
        categories: ["seo"],
    },
    endpoint: "/google/ads-transparency",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleAdsTransparencyQuery.extend({
                engine: zEngine("google_ads_transparency_center"),
            }),
        },
    },
});
