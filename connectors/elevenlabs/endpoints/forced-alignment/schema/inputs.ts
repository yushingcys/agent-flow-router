import { z } from "zod";
import { zAudioFile } from "../../../schema/audio.ts";

/** POST /v1/forced-alignment multipart fields. */
export const zAlignmentBody = z.looseObject({
    file: zAudioFile,
    text: z.string().min(1).describe(
        "The transcript to align with the audio, in any format. " +
            "Diarization is not supported.",
    ),
});
