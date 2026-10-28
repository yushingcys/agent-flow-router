import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `youtube_video_transcript` engine query parameters (https://serpapi.com/youtube-video-transcript,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYoutubeTranscriptQuery = z.strictObject({
    v: z.string().min(1).describe(
        "The Video ID, it can be found in the URL of the video as youtu.be/video_id or youtube.com/watch?v=video_id",
    ),
    language_code: z.string().describe(
        "The language to use for the YouTube video transcript. It accepts a language code, which may be a two-letter or extended code (e.g., en for English, es-ES for Spanish (Spain), or zh-Hans for Simplified Chinese). If no language is provided, the default language will be English (en). If the requested language code is not available for the video, the first available language for the transcript will be used instead.",
    ).optional(),
    title: z.string().describe(
        "Parameter is used to get the specific transcript using the transcript title, e.g. Twitch Chat - Simple.",
    ).optional(),
    type: z.string().describe(
        "Parameter is used to get the transcript type. E.g: asr for automatic speech recognition (auto-generated) transcript.",
    ).optional(),
    ...serpApiParams,
});
