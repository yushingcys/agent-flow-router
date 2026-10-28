import { assert, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) =>
    loadFixture(`${fixtures}synthetic-${name}.json`);

Deno.test("tikhub: generated endpoints share one auth, one pool, and a flat USD price", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("tikhub#")
    );
    assertEquals(ids.length, 894);
    const auth = bundle.endpoints[ids[0]].auth.inject.$fn.key;
    const fromError = bundle.endpoints[ids[0]].output.fromError?.$fn.key;
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(
            doc.request.url,
            `https://api.tikhub.io/${id.slice("tikhub#".length)}`,
        );
        assertEquals(doc.auth.inject.$fn.key, auth, id);
        assertEquals(doc.output.fromError?.$fn.key, fromError, id);
        assertEquals(doc.usage.consolidate, undefined, id);
        const model = doc.usage.model;
        // a FREE doc drains no pool, so the compiler narrows credits to {}
        if (model.kind === "FREE") continue;
        assertEquals(doc.usage.credits, { default: { label: "US dollars" } });
        assertEquals(model.kind, "PER_CALL", id);
        assert("consumes" in model && model.consumes.amount > 0, id);
    }
});

/** One representative call per platform: [endpoint path, fixture, input, USD]. */
const CASES: [string, string, Record<string, Json>, number][] = [
    ["tiktok/app/v3/fetch_one_video", "tiktok-video", {
        queryParams: { aweme_id: "7350810998023949599" },
    }, 0.001],
    ["tiktok/shop/web/fetch_product_detail_v3", "tiktok-shop-product", {
        queryParams: { product_id: "1732108663255959373", region: "US" },
    }, 0.001],
    ["douyin/web/fetch_one_video", "douyin-video", {
        queryParams: { aweme_id: "7372484719365098803" },
    }, 0.001],
    ["douyin/web/get_all_webcast_id", "douyin-webcast-ids", {
        body: ["https://live.douyin.com/775841227732"],
    }, 0.001],
    ["instagram/v2/fetch_user_info", "instagram-user", {
        queryParams: { username: "instagram" },
    }, 0.002],
    ["youtube/web_v2/get_video_info", "youtube-video", {
        queryParams: { video_id: "oaSNBz4qMQY" },
    }, 0.001],
    ["reddit/app/fetch_post_details", "reddit-post", {
        queryParams: { post_id: "t3_1ojnh50" },
    }, 0.001],
    ["bilibili/web/fetch_one_video", "bilibili-video", {
        queryParams: { bv_id: "BV1M1421t7hT" },
    }, 0.001],
    ["kuaishou/app/fetch_one_video", "kuaishou-video", {
        queryParams: { photo_id: "3xhpk3xcf6e4iac" },
    }, 0.001],
    ["weibo/app/fetch_status_detail", "weibo-status", {
        queryParams: { status_id: "5016922058656962" },
    }, 0.001],
    ["xiaohongshu/web_v3/fetch_user_info", "xiaohongshu-user", {
        queryParams: { user_id: "5e3a8ee700000000010070c6" },
    }, 0.01],
    ["wechat_channels/v2/fetch_video_detail", "wechat-channels-video", {
        body: { object_id: "14512345678901234567" },
    }, 0.01],
    ["wechat_mp/v2/fetch_article_detail", "wechat-mp-article", {
        body: { url: "https://mp.weixin.qq.com/s/synthetic" },
    }, 0.01],
    ["wechat_search/v2/fetch_search", "wechat-search", {
        body: { keyword: "人民日报" },
    }, 0.01],
    ["zhihu/web/fetch_hot_list", "zhihu-hot-list", {
        queryParams: { limit: "2" },
    }, 0.001],
    ["threads/web/fetch_user_posts", "threads-user-posts", {
        queryParams: { user_id: "63625256886" },
    }, 0.002],
    ["linkedin/web_v2/get_post_comments", "linkedin-post-comments", {
        queryParams: { urn: "7267273010393358336" },
    }, 0.05],
    ["lemon8/app/fetch_post_detail", "lemon8-post", {
        queryParams: { item_id: "7361926875709129222" },
    }, 0.001],
    ["pipixia/app/fetch_post_detail", "pipixia-post", {
        queryParams: { cell_id: "7411193113223371043" },
    }, 0.001],
    ["xigua/app/v2/fetch_one_video", "xigua-video", {
        queryParams: { item_id: "7354954305222377999" },
    }, 0.001],
    ["toutiao/app/get_user_info", "toutiao-user", {
        queryParams: { user_id: "1352838578180211" },
    }, 0.001],
    ["telegram/web/fetch_channel_info", "telegram-channel", {
        queryParams: { channel: "durov" },
    }, 0.001],
];

for (const [path, name, input, usd] of CASES) {
    const id = `tikhub#api/v1/${path}`;
    Deno.test(`${id} happy (synthetic): one call billed $${usd}`, async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit(id),
            input,
            mode: "replay",
            fixture: await fixture(name),
        });
        assertEquals(result.httpStatus, 200);
        assertEquals(result.isProviderError, false);
        assertEquals(result.usage, {
            credits: { default: usd },
            evidence: { CALL: 1 },
        });
        const output = result.output as Record<string, Json>;
        assertEquals(output.router, `/api/v1/${path}`);
        assert(output.data !== undefined && output.data !== null);
    });
}

Deno.test("tikhub: a free endpoint (async captions result) bills nothing", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(
            "tikhub#api/v1/youtube/web_v2/get_video_captions_result",
        ),
        input: {
            queryParams: { job_id: "123e4567-e89b-12d3-a456-426614174000" },
        },
        mode: "replay",
        fixture: await fixture("youtube-captions-result"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("tikhub: a 401 digests detail.message and bills nothing", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(
            "tikhub#api/v1/bilibili/web/fetch_one_video",
        ),
        input: { queryParams: { bv_id: "BV1M1421t7hT" } },
        mode: "replay",
        fixture: await fixture("unauthorized"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Invalid API token. Please check your Authorization header.",
    );
});

Deno.test("tikhub: a 422 digests the first validation msg", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("tikhub#api/v1/zhihu/web/fetch_hot_list"),
        input: { queryParams: {} },
        mode: "replay",
        fixture: await fixture("validation-error"),
    });
    assertEquals(result.httpStatus, 422);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Field required",
    );
});

Deno.test({
    name: "tikhub#api/v1/bilibili/web/fetch_one_video live",
    ignore: liveSkip("tikhub"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit(
                "tikhub#api/v1/bilibili/web/fetch_one_video",
            ),
            input: { queryParams: { bv_id: "BV1M1421t7hT" } },
            mode: "live",
        });
        assertEquals(result.httpStatus, 200);
        assertEquals(result.usage.credits, { default: 0.001 });
    },
});
