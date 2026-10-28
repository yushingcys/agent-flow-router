import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoSdrToHdrBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/sdr-to-hdr",
    meta: {
        displayName: "Convert Video from SDR to HDR",
        summary:
            "Hyperion: expands standard dynamic range video into 10-bit HDR.",
        description: "Convert standard dynamic range video, including 8-bit " +
            "AI-generated clips, into HDR with Topaz Hyperion, expanding " +
            "highlights and color for 10-bit and higher delivery. Pair " +
            "with a 10-bit encoder profile (H265 Main10, ProRes, AV1 " +
            "10-bit). Returns the request status with a signed download " +
            "link (7 days). Billed by output frames at the output " +
            "resolution (Hyperion 2 and 2.5 about 23 credits per 10 s of " +
            "1080p30, 50 at 4K).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/video-utilities",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoSdrToHdrBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
