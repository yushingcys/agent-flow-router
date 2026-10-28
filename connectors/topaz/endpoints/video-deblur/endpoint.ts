import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoDeblurBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/deblur",
    meta: {
        displayName: "Remove Motion Blur from Video",
        summary:
            "Themis 2: recovers clarity in fast-moving or handheld footage.",
        description:
            "Remove motion blur from fast-moving or handheld footage with " +
            "Topaz Themis 2, recovering edges and detail smeared by " +
            "camera shake or subject motion. Returns the request status " +
            "with a signed download link (7 days). Billed by output " +
            "frames at the output resolution (about 1 credit per 10 s of " +
            "1080p30).",
        categories: ["video-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/video-models/video-utilities/themis-2-motion-deblur",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoDeblurBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
