import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoUpscaleCreativeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/upscale-creative",
    meta: {
        displayName: "Upscale Video with Creative Detail",
        summary:
            "Astra 2: creative diffusion upscaling that invents new detail and texture in AI-generated video.",
        description:
            "Upscale AI-generated and stylized video with Topaz Astra 2, " +
            "a creative diffusion model that invents new detail and " +
            "texture, optionally steered by a prompt and a creativity " +
            "level. The most expensive video model (about 30 credits per " +
            "10 s of 1080p30, 50 at 4K). Returns the request status with " +
            "a signed download link (7 days).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/astra/astra-2",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoUpscaleCreativeBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
