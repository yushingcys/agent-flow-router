import { assert, assertEquals } from "@std/assert";
import { compileToOutput } from "../scripts/lib.ts";
import { rankEndpoints } from "./mod.ts";

const { bundle } = await compileToOutput();
const docs = Object.values(bundle.endpoints);

// Realistic agent queries; any listed endpoint in the top 3 counts as a hit.
const EVAL: [string, string[]][] = [
    ["tavily search answer", ["tavily#search"]],
    ["scrape a website to markdown", [
        "firecrawl#scrape",
        "contextdev#web/scrape/markdown",
        "jina#read",
        "tavily#extract",
    ]],
    ["text to speech", [
        "elevenlabs#text-to-speech",
        "fishaudio#text-to-speech",
        "minimax#v1/t2a_v2",
    ]],
    ["linkedin profile", [
        "apify#dev_fusion/linkedin-profile-scraper",
        "tikhub#api/v1/linkedin/web_v2/get_user_profile",
        "contactout#v1/linkedin/enrich/work-email",
        "contactout#v1/linkedin/enrich/personal-email",
    ]],
    ["crypto token price", [
        "defillama#coins/prices/current/{coins}",
        "defillama#free/prices/current/{coins}",
        "surf#dex/token/price",
        "surf#exchange/price",
        "surf#market/price",
    ]],
    ["google search results", [
        "serpapi#google/search",
        "dataforseo#serp/google-organic",
        "litescrape#google/search",
        "mrscraper#serp/google",
        "cloro#monitor/google",
    ]],
    ["tiktok videos of a user", [
        "tikhub#api/v1/tiktok/web/fetch_user_post",
        "tikhub#api/v1/tiktok/app/v3/fetch_user_post_videos",
        "tikhub#api/v1/tiktok/app/v3/fetch_user_post_videos_v2",
        "tikhub#api/v1/tiktok/app/v3/fetch_user_post_videos_v3",
        "apify#apidojo/tiktok-scraper",
    ]],
    ["firecrawl crawl a site", ["firecrawl#crawl"]],
    ["exa search", ["exa#search"]],
    ["elevenlabs text to speech", ["elevenlabs#text-to-speech"]],
    ["youtube video transcript", [
        "serpapi#youtube/transcript",
        "apify#starvibe/youtube-video-transcript",
        "apify#johnvc/youtubetranscripts",
    ]],
    ["transcribe audio to text", [
        "elevenlabs#v1/speech-to-text",
        "fishaudio#speech-to-text",
    ]],
    ["upscale an image", ["topaz#image/upscale"]],
    ["create an email inbox", ["agentmail#create-inboxes"]],
    ["backlinks for a domain", [
        "ahrefs#site-explorer/all-backlinks",
        "ahrefs#site-explorer/backlinks-stats",
        "dataforseo#backlinks/backlinks",
        "dataforseo#backlinks/summary",
        "dataforseo#backlinks/domain-pages-summary",
    ]],
    ["instagram profile", [
        "apify#apify/instagram-profile-scraper",
        "serpapi#instagram/profile",
    ]],
    ["reddit posts", ["apify#trudax/reddit-scraper-lite"]],
];

// tikhub's generated metadata says "homepage video" for a user's posts and
// ties with "user like video"; keywords cannot tell them apart.
const KNOWN_MISSES = ["tiktok videos of a user"];

Deno.test("discover returns the expected endpoint in the top 3", () => {
    const misses = EVAL.filter(([query, want]) =>
        !rankEndpoints(docs, query).slice(0, 3).some((doc) =>
            want.includes(doc.id)
        )
    ).map(([query]) => query);
    console.log(
        `top-3 recall ${EVAL.length - misses.length}/${EVAL.length}`,
        misses,
    );
    for (const [, want] of EVAL) {
        for (const id of want) assert(bundle.endpoints[id], id);
    }
    assertEquals(misses, KNOWN_MISSES);
});

Deno.test("discover surfaces a provider named in the query", () => {
    for (const provider of new Set(docs.map((doc) => doc.provider))) {
        assertEquals(rankEndpoints(docs, provider)[0]?.provider, provider);
    }
});

Deno.test("discover spreads generic queries across providers", () => {
    for (const query of ["search", "scrape", "video", "profile", "price"]) {
        const top = rankEndpoints(docs, query).slice(0, 10);
        const counts = Map.groupBy(top, (doc) => doc.provider);
        assert(
            [...counts.values()].every((rows) => rows.length <= 3),
            `${query}: ${top.map((doc) => doc.id)}`,
        );
    }
});
