import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoDeinterlaceBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/deinterlace",
    meta: {
        displayName: "Deinterlace and Upscale Old Footage",
        summary:
            "Dione: deinterlacing and upscaling for 480i/576i/1080i broadcast, DV and DVD sources.",
        description: "Deinterlace and upscale legacy interlaced footage " +
            "(480i/576i/1080i broadcast, DV tapes, DVD) with Topaz Dione " +
            "into clean progressive video, with variants for TV, DV, " +
            "difficult sources, and halo removal. Returns the request " +
            "status with a signed download link (7 days). Billed by " +
            "output frames at the output resolution (about 2 credits per " +
            "10 s of 1080p30, 6 at 4K).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/proteus/dione",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoDeinterlaceBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
