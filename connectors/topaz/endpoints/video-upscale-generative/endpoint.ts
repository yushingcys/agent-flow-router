import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoUpscaleGenerativeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/upscale-generative",
    meta: {
        displayName: "Upscale Video with Realistic Detail",
        summary:
            "Starlight: diffusion upscaling that restores realistic faces, textures and text in GenAI and archival video.",
        description:
            "Upscale AI-generated and archival video up to 4K with Topaz " +
            "Starlight, a diffusion model that restores realistic faces, " +
            "fabrics, textures and legible text with temporal " +
            "consistency. Much slower and costlier than the precision " +
            "upscalers (about 12 credits per 10 s of 1080p30, 25 at 4K; " +
            "Fast 2 half that). Returns the request status with a signed " +
            "download link (7 days).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/starlight",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoUpscaleGenerativeBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
