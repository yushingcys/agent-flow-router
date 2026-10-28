import { z } from "zod";
import { videoBody, zEnhanceKnobs } from "../../../schema/video.ts";

/**
 * `POST /video/` body with this tool's filter, read 2026-10-27 from
 * https://developer.topazlabs.com/video-models/proteus/dione
 */
export const zVideoDeinterlaceBody = videoBody(
    z.object({
        model: z
            .enum(["dtv-4", "ddv-3", "dtvs-2", "dtd-4", "dtds-2"])
            .describe(
                "Dione model by source: dtv-4 TV broadcast, ddv-3 DV " +
                    "camcorder, dtvs-2 robust (difficult sources), dtd-4 dehalo, " +
                    "dtds-2 robust dehalo. Set videoType Interlaced (and " +
                    "fieldOrder if known).",
            ),
        ...zEnhanceKnobs,
    }).strict(),
);
