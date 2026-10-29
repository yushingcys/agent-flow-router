import { z } from "zod";

/** `GET /media/{media_type}/models/free` path parameter. The music
 *  rankings (`music/instrumental`, `music/with-vocals`) are left out: the
 *  engine percent-encodes a path parameter, so a two-segment value cannot
 *  ride in one placeholder, and Monid's endpoint covers speech, image, and
 *  video only. */
export const zMediaModelsPath = z.strictObject({
    media_type: z.enum([
        "text-to-image",
        "image-editing",
        "text-to-video",
        "image-to-video",
        "text-to-video-audio",
        "image-to-video-audio",
        "text-to-speech",
        "speech-to-speech",
        "speech-to-text",
    ]).describe(
        "Which arena or leaderboard to read. text-to-video and " +
            "image-to-video rank silent video; the -audio variants rank " +
            "video with generated audio.",
    ),
});
