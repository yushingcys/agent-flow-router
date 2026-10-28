import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoFixArtifactsBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/fix-artifacts",
    meta: {
        displayName: "Upscale and Fix Video Artifacts",
        summary:
            "Artemis: balanced denoise, sharpen and upscale tuned per source quality and artifact type.",
        description:
            "Clean up and upscale compressed, noisy or haloed video with " +
            "Topaz Artemis, a balanced denoise and sharpen model with " +
            "variants per source quality (high, medium, low), halo " +
            "strength, and aliasing or moire. Returns the request status " +
            "with a signed download link (7 days). Billed by output " +
            "frames at the output resolution (about 2 credits per 10 s of " +
            "1080p30, 6 at 4K).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/proteus/artemis",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoFixArtifactsBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
