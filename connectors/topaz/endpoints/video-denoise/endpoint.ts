import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoDenoiseBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/denoise",
    meta: {
        displayName: "Denoise Video",
        summary:
            "Nyx: sensor-noise and grain removal for low-light and high-ISO footage.",
        description:
            "Remove sensor noise and grain from low-light and high-ISO " +
            "footage with Topaz Nyx while preserving natural texture, " +
            "with fast, extra-strength and high-fidelity variants. " +
            "Returns the request status with a signed download link (7 " +
            "days). Billed by output frames at the output resolution " +
            "(about 1 credit per 10 s of 1080p30; XL and High Fidelity " +
            "about 2).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/denoise",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoDenoiseBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
