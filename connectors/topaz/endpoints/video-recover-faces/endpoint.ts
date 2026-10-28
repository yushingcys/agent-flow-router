import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateVideo, pollVideo, startVideo } from "../../schema/video.ts";
import { zVideoRecoverFacesBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/video/recover-faces",
    meta: {
        displayName: "Recover Faces in Video",
        summary:
            "Iris: face-focused recovery for low and medium quality footage, with upscaling.",
        description:
            "Recover faces in low and medium quality footage with Topaz " +
            "Iris, which upscales and denoises while reconstructing " +
            "facial detail. Suited to old home video, interviews and " +
            "compressed clips. Returns the request status with a signed " +
            "download link (7 days). Billed by output frames at the " +
            "output resolution (about 2 credits per 10 s of 1080p30, 6 at " +
            "4K).",
        categories: ["video-enhancement"],
        docsUrl: "https://developer.topazlabs.com/video-models/proteus/iris",
    },
    request: { method: "POST", path: "/video/" },
    input: { schema: { body: zVideoRecoverFacesBody } },
    lifecycle: { start: startVideo, poll: pollVideo },
    usage: { model: creditModel, estimate: estimateVideo },
});
