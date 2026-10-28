import { z } from "zod";

/** GET|DELETE /model/{id} path. */
export const zVoicePathParams = z.object({
    id: z.string().min(1).describe(
        "The voice id (`_id` from fishaudio#voices or fishaudio#voices/clone).",
    ),
});
