import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoColorizeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/colorize",
    meta: {
        displayName: "Colorize Black and White Video",
        summary:
            "Automatic, temporally stable colorization for black-and-white footage.",
        description:
            "Colorize black-and-white footage automatically with Topaz, " +
            "producing natural color that stays stable from frame to " +
            "frame instead of flickering. Returns the request status with " +
            "a signed download link (7 days). Billed by output frames at " +
            "the output resolution (about 1 credit per 10 s of 1080p30).",
        categories: ["video-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/video-models/video-utilities/video-colorization",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoColorizeBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
