import { z } from "zod";
import { zAudioFile, zFileFormat } from "../../../schema/audio.ts";

/** POST /v1/audio-isolation multipart fields. */
export const zIsolationBody = z.looseObject({
    audio: zAudioFile,
    file_format: zFileFormat.optional(),
});
