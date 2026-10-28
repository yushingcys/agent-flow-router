import { z } from "zod";
import { zBinaryPart } from "@shared/core";

/** POST /v1/asr multipart fields, plus our `model` (the vendor's `model`
 *  HEADER). */
export const zAsrBody = z.looseObject({
    model: z.enum(["transcribe-1-pro", "transcribe-1"]).describe(
        "transcribe-1-pro (speaker turns, long recordings, emotion cues; " +
            "recommended) or transcribe-1 (vendor default). Same price.",
    ).optional(),
    audio: zBinaryPart.describe(
        "The recording as {base64, contentType?, filename?}.",
    ),
    language: z.string().describe(
        "Language hint; it is detected regardless and returned as " +
            "`language_code`.",
    ).nullable().optional(),
    ignore_timestamps: z.boolean().describe(
        "Skip precise segment timestamps (default true; false adds " +
            "latency on clips under 30 s).",
    ).optional(),
});
