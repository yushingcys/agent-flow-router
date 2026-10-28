import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoUpscaleAnimationBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/upscale-animation",
    meta: {
        displayName: "Upscale Animation and CG Video",
        summary:
            "Gaia: refinement and upscaling for clean CGI, animation and motion graphics.",
        description:
            "Upscale and refine animation, CGI and motion graphics with " +
            "Topaz Gaia, tuned for clean lines and flat color rather than " +
            "camera footage. Gaia 2 does frame-by-frame 2x animation " +
            "upscaling at a lower rate. Returns the request status with a " +
            "signed download link (7 days). Billed by output frames at " +
            "the output resolution (about 2 credits per 10 s of 1080p30, " +
            "6 at 4K; Gaia 2 about half).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/proteus/gaia",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoUpscaleAnimationBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
