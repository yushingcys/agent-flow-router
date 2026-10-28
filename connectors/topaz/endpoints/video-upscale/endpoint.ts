import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoUpscaleBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/upscale",
    meta: {
        displayName: "Upscale Video",
        summary:
            "Precision video upscaling with the Proteus family (Proteus, Proteus Natural, Rhea, Theia).",
        description: "Upscale and enhance camera, CGI or AI-generated " +
            "video up to 8K with Topaz's precision models, which improve " +
            "resolution, noise and compression artifacts without changing " +
            "the footage's character. Proteus suits most sources, Proteus " +
            "Natural keeps a more natural look, Rhea targets fine detail at " +
            "4x, and Theia exposes manual detail/fidelity control. Returns " +
            "the request status with a signed download link (7 days). " +
            "Billed by output frames at the output resolution (about 2 " +
            "credits per 10 s of 1080p30, 6 at 4K).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/proteus",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoUpscaleBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
