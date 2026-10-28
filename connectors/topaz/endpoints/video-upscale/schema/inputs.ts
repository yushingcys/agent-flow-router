import { z } from "zod";
import { videoBody, zEnhanceKnobs } from "../../../schema/video.ts";

/** `POST /video/` with a Proteus-family precision upscale filter
 *  (video-models/proteus, read 2026-10-27). */
export const zVideoUpscaleBody = videoBody(
    z.object({
        model: z
            .enum(["prob-4", "pnat-1", "rhea-1", "thd-3", "thf-4"])
            .describe(
                "prob-4: Proteus, the default for most footage. pnat-1: " +
                    "Proteus Natural, a more natural look. rhea-1: Rhea, " +
                    "high-fidelity 4x upscaling of fine detail. thd-3 / " +
                    "thf-4: Theia tuned for detail / for fidelity, with " +
                    "manual control.",
            ),
        ...zEnhanceKnobs,
    }).strict(),
);
