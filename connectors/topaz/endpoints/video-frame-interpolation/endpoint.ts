import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoFrameInterpolationBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/frame-interpolation",
    meta: {
        displayName: "Slow Motion and Frame Rate Conversion",
        summary:
            "Apollo, Chronos and Aion frame interpolation: smooth slow motion and clean frame-rate changes.",
        description:
            "Generate in-between frames with Topaz's interpolation models " +
            "for smooth slow motion (up to 16x) or clean frame-rate " +
            "conversion (for example 24 to 60 fps). Apollo handles " +
            "general motion, Chronos natural real-world motion, Aion " +
            "extreme slow motion of complex high-resolution scenes; Fast " +
            "variants trade quality for speed. Returns the request status " +
            "with a signed download link (7 days). Billed by OUTPUT " +
            "frames, so slow motion multiplies the price (Apollo/Chronos " +
            "about 19 credits for 10 s of 1080p30 at 16x).",
        categories: ["video-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/video-models/frame-interpolation",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoFrameInterpolationBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
