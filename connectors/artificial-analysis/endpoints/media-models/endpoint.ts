import { defineEndpoint } from "@shared/core";
import { zMediaModelsPath } from "./schema/inputs.ts";

/** GET /media/{media_type}/models/free - works with any key tier. */
export default defineEndpoint({
    meta: {
        displayName: "List Speech, Image, and Video Models",
        summary: "Arena Elo rankings for image, video, and speech models.",
        description: "Read one Artificial Analysis media leaderboard: " +
            "text-to-image, image editing, text-to-video or image-to-video " +
            "(silent or with audio) arena rankings, the text-to-speech " +
            "arena, or the speech-to-speech and speech-to-text model " +
            "lists. Each model carries its id, name, slug, creator, and " +
            "(for arenas) Elo with its 95% confidence interval.",
        docsUrl:
            "https://artificialanalysis.ai/data-api/docs/reference#getTextToImageArenaFree",
    },
    endpoint: "/get_speech_image_video_models",
    request: { method: "GET", path: "/media/{media_type}/models/free" },
    input: { schema: { pathParams: zMediaModelsPath } },
});
