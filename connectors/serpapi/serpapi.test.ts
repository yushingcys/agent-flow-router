import { assert, assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
import { fromFileUrl } from "@std/path";
import {
    estimateEndpoint,
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

/** Every endpoint Monid lists for SerpApi (monid.ai/tools/serpapi, read
 *  2026-10-27) and the SerpApi engine it runs; null = no engine. */
const ENGINES: Record<string, string | null> = {
    "airbnb/search": "airbnb",
    "amazon/autocomplete": "amazon_autocomplete",
    "amazon/product": "amazon_product",
    "amazon/search": "amazon",
    "apple-app-store/product": "apple_product",
    "apple-app-store/reviews": "apple_reviews",
    "apple-app-store/search": "apple_app_store",
    "apple-maps/place": "apple_maps_places",
    "apple-maps/search": "apple_maps",
    "baidu/news": "baidu_news",
    "baidu/search": "baidu",
    "bing/copilot": "bing_copilot",
    "bing/images": "bing_images",
    "bing/maps": "bing_maps",
    "bing/news": "bing_news",
    "bing/product": "bing_product",
    "bing/reverse-image": "bing_reverse_image",
    "bing/search": "bing",
    "bing/shopping": "bing_shopping",
    "bing/videos": "bing_videos",
    "brave/ai-mode": "brave_ai_mode",
    "duckduckgo/ai-chat": "duck_ai",
    "duckduckgo/light-search": "duckduckgo_light",
    "duckduckgo/maps": "duckduckgo_maps",
    "duckduckgo/news": "duckduckgo_news",
    "duckduckgo/search": "duckduckgo",
    "ebay/product": "ebay_product",
    "ebay/search": "ebay",
    "ebay/seller": "ebay_seller",
    "extract/crawl": "extract",
    "extract/map": "extract",
    "extract/page": "extract",
    "facebook/profile": "facebook_profile",
    "google-play/apps": "google_play",
    "google-play/books": "google_play_books",
    "google-play/games": "google_play_games",
    "google-play/movies": "google_play_movies",
    "google-play/product": "google_play_product",
    "google/ads": "google_ads",
    "google/ads-transparency": "google_ads_transparency_center",
    "google/ai-mode": "google_ai_mode",
    "google/ai-overview": "google_ai_overview",
    "google/autocomplete": "google_autocomplete",
    "google/events": "google_events",
    "google/finance": "google_finance",
    "google/finance-markets": "google_finance_markets",
    "google/flights": "google_flights",
    "google/flights-autocomplete": "google_flights_autocomplete",
    "google/flights-deals": "google_flights_deals",
    "google/forums": "google_forums",
    "google/gemini": "google_gemini",
    "google/hotels": "google_hotels",
    "google/hotels-autocomplete": "google_hotels_autocomplete",
    "google/hotels-photos": "google_hotels_photos",
    "google/hotels-reviews": "google_hotels_reviews",
    "google/images": "google_images",
    "google/images-light": "google_images_light",
    "google/images-related": "google_images_related_content",
    "google/immersive-product": "google_immersive_product",
    "google/jobs": "google_jobs",
    "google/lens": "google_lens",
    "google/light-search": "google_light",
    "google/local": "google_local",
    "google/local-services": "google_local_services",
    "google/maps": "google_maps",
    "google/maps-autocomplete": "google_maps_autocomplete",
    "google/maps-contributor-reviews": "google_maps_contributor_reviews",
    "google/maps-directions": "google_maps_directions",
    "google/maps-photos": "google_maps_photos",
    "google/maps-posts": "google_maps_posts",
    "google/maps-reviews": "google_maps_reviews",
    "google/news": "google_news",
    "google/news-light": "google_news_light",
    "google/patent-details": "google_patents_details",
    "google/patents": "google_patents",
    "google/product": "google_product",
    "google/related-questions": "google_related_questions",
    "google/reverse-image": "google_reverse_image",
    "google/scholar": "google_scholar",
    "google/scholar-author": "google_scholar_author",
    "google/scholar-case-law": "google_scholar_case_law",
    "google/search": "google",
    "google/shopping": "google_shopping",
    "google/shopping-light": "google_shopping_light",
    "google/short-videos": "google_short_videos",
    "google/sports": "google_sports",
    "google/travel-explore": "google_travel_explore",
    "google/trends": "google_trends",
    "google/trends-autocomplete": "google_trends_autocomplete",
    "google/trends-trending-now": "google_trends_trending_now",
    "google/videos": "google_videos",
    "google/videos-light": "google_videos_light",
    "home-depot/product": "home_depot_product",
    "home-depot/product-reviews": "home_depot_product_reviews",
    "home-depot/search": "home_depot",
    "instagram/profile": "instagram_profile",
    "locations": null,
    "naver/ai-mode": "naver_ai_mode",
    "naver/ai-overview": "naver_ai_overview",
    "naver/search": "naver",
    "opentable/reviews": "open_table_reviews",
    "search-index/search": "search_index",
    "target/search": "target",
    "tripadvisor/place": "tripadvisor_place",
    "tripadvisor/reviews": "tripadvisor_reviews",
    "tripadvisor/search": "tripadvisor",
    "walmart/product": "walmart_product",
    "walmart/product-reviews": "walmart_product_reviews",
    "walmart/search": "walmart",
    "yahoo/images": "yahoo_images",
    "yahoo/search": "yahoo",
    "yahoo/trends": "yahoo_trends",
    "yahoo/videos": "yahoo_videos",
    "yandex/images": "yandex_images",
    "yandex/search": "yandex",
    "yandex/videos": "yandex_videos",
    "yelp/place": "yelp_place",
    "yelp/reviews": "yelp_reviews",
    "yelp/search": "yelp",
    "youtube/channel": "youtube_channel",
    "youtube/search": "youtube",
    "youtube/transcript": "youtube_video_transcript",
    "youtube/video": "youtube_video",
    "zillow/search": "zillow",
};

Deno.test("serpapi: Monid's 124 endpoints, one auth fn, one engine each", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("serpapi#")
    ).sort();
    assertEquals(ids, Object.keys(ENGINES).map((p) => `serpapi#${p}`).sort());
    assertEquals(ids.length, 124);
    const auth = bundle.endpoints["serpapi#google/search"].auth.inject.$fn.key;
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        const engine = ENGINES[id.slice("serpapi#".length)];
        assertEquals(doc.request.method, "GET", id);
        assertEquals(
            doc.request.url,
            engine === null
                ? "https://serpapi.com/locations.json"
                : "https://serpapi.com/search",
            id,
        );
        assertEquals(doc.auth.inject.$fn.key, auth, id);
        const query = doc.input.schema.queryParams as {
            properties: Record<string, { const?: string; default?: string }>;
        };
        assertEquals(query.properties.engine?.default, engine ?? undefined, id);
        assertEquals("api_key" in query.properties, false, id);
        const kind = doc.usage.model.kind;
        assertEquals(
            kind,
            id === "serpapi#locations"
                ? "FREE"
                : id === "serpapi#extract/crawl"
                ? "PER_UNIT"
                : "PER_CALL",
            id,
        );
    }
});

Deno.test("serpapi#google/search happy (synthetic): one search billed, key in the query", async () => {
    const unit = await testSealedUnit("serpapi#google/search");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "coffee", hl: "en" } },
        mode: "replay",
        fixture: await fixture("synthetic-search-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as { organic_results: unknown[] };
    assertEquals(output.organic_results.length, 2);
});

Deno.test("serpapi#google/search provider error (synthetic 401): data, zero usage", async () => {
    const unit = await testSealedUnit("serpapi#google/search");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "anything" } },
        mode: "replay",
        fixture: await fixture("synthetic-invalid-key"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assert(
        (result.output as { message: string }).message.startsWith(
            "Invalid API key.",
        ),
    );
});

Deno.test("serpapi#google/search: q required, engine fixed, strict keys", async () => {
    const unit = await testSealedUnit("serpapi#google/search");
    const synthetic = await fixture("synthetic-search-ok");
    const rejected: Record<string, Json>[] = [
        {},
        { q: "" },
        { q: "x", engine: "bing" },
        { q: "x", api_key: "k" },
        { q: "x", start: "10" },
        { q: "x", bogus: 1 },
    ];
    for (const queryParams of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { queryParams },
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
});

Deno.test("serpapi#extract/crawl (synthetic): billed per extracted page, failed pages free", async () => {
    const unit = await testSealedUnit("serpapi#extract/crawl");
    const url = "https://books.toscrape.com/";
    assertEquals(
        (await estimateEndpoint(unit, { queryParams: { url } })).credits,
        { default: 10 },
    );
    assertEquals(
        (await estimateEndpoint(unit, { queryParams: { url, max_pages: 3 } }))
            .credits,
        { default: 3 },
    );
    const result = await runEndpoint({
        unit,
        input: { queryParams: { url, max_pages: 3, max_depth: 1 } },
        mode: "replay",
        fixture: await fixture("synthetic-crawl-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 2 },
        evidence: { RESULT: 2 },
    });
});

Deno.test("serpapi#locations (synthetic): free lookup", async () => {
    const unit = await testSealedUnit("serpapi#locations");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "Austin", limit: 2 } },
        mode: "replay",
        fixture: await fixture("synthetic-locations-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals((result.output as unknown[]).length, 2);
});

Deno.test({
    name: "serpapi#google/search live (gated on SERPAPI_API_KEY)",
    ignore: liveSkip("serpapi"),
    fn: async () => {
        const unit = await testSealedUnit("serpapi#google/search");
        const result = await runEndpoint({
            unit,
            input: { queryParams: { q: "coffee", hl: "en" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
    },
});
