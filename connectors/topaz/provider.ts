import { defineProvider, presets } from "@shared/core";

/**
 * Topaz Labs (developer.topazlabs.com) - AI image and video enhancement.
 *
 * Two vendor APIs under one origin, both asynchronous jobs:
 *   - Image (`/image/v1/<tool>/async`): a multipart/form-data submit that
 *     takes the source as `source_url`, polled on `/image/v1/status/{id}`;
 *     the finished image's link comes from `/image/v1/download/{id}`. The
 *     lifecycle lives in `schema/image.ts`.
 *   - Video (`/video/`): a FREE create request that quotes the job from the
 *     caller's source metadata, then `PATCH /video/{id}/accept` reserves the
 *     credits and starts processing (the source is fetched from a URL, so
 *     there is nothing to upload), polled on `/video/{id}/status`. The
 *     lifecycle lives in `schema/video.ts`.
 *
 * Each endpoint follows Monid's path for the same tool (`topaz#video/upscale`
 * is one model family on Topaz's shared `/video/` route), so the vendor
 * route rides `request.path` and the identity rides `endpoint`.
 *
 * Billing is in Topaz CREDITS, deducted only when a job completes: images
 * by output megapixels, video by output frames at the output resolution.
 * The completed job reports what it bills (image `credits`, video the lower
 * bound of `estimates.cost`, the figure Topaz documents as billed), and that
 * is what the run settles on. The pre-run hold is each endpoint's estimate
 * from the request (see the schema modules).
 */
export default defineProvider({
    name: "topaz",
    meta: {
        displayName: "Topaz Labs",
        summary:
            "AI image and video enhancement: upscaling, denoise, sharpening, restoration, frame interpolation, and SDR to HDR.",
        description: "Topaz Labs enhancement models behind one API. Video: " +
            "precision upscaling (Proteus, Rhea, Theia), generative " +
            "(Starlight) and creative (Astra) upscaling, artifact repair " +
            "(Artemis), deinterlacing (Dione), animation (Gaia), face " +
            "recovery (Iris), denoise (Nyx), motion deblur (Themis), " +
            "colorization, SDR to HDR (Hyperion), and frame interpolation " +
            "(Apollo, Chronos, Aion). Image: Gigapixel precision upscaling, " +
            "Wonder generative and Bloom creative upscaling, transparent " +
            "PNG upscaling, sharpening, denoise, restoration, lighting and " +
            "color, and background removal. Every job is asynchronous and " +
            "billed in Topaz credits by output size.",
        homepageUrl: "https://www.topazlabs.com",
        docsUrl: "https://developer.topazlabs.com",
        categories: ["image-enhancement", "video-enhancement"],
        notes: [
            "Every job is asynchronous: the run polls until Topaz finishes " +
            "(seconds for images, minutes or longer for video).",
            "Sources are fetched by Topaz from a public https:// URL; file " +
            "uploads are not supported.",
            "Billing is in Topaz credits (US$0.10 each at Monid's list " +
            "price), charged only for completed jobs. The run settles on " +
            "the credits Topaz reports; the pre-run hold is an estimate.",
            "Result links are presigned and expire (images after 1 hour, " +
            "video after 7 days) - download promptly.",
        ],
    },
    auth: { inject: presets.auth.header("X-API-Key") },
    request: { baseUrl: "https://api.topazlabs.com" },
    // images finish in seconds; long or 4K video runs for many minutes
    timeouts: { requestMs: 60_000, runMs: 3_600_000, pollMs: 5_000 },
    usage: {
        credits: {
            default: {
                label: "Topaz credits",
                description:
                    "Topaz Labs API credits; Monid lists them at US$0.10 each.",
            },
        },
        /** The vendor's own meter on the completed job: an image status
         *  carries `credits`; a video status carries `estimates.cost`, whose
         *  lower bound is what Topaz bills. Absent means a vendor anomaly,
         *  zero-billed and said out loud. */
        evidence: ({ data, utils, logger }) => {
            const credits = utils.json.optionalNum(data.output, "$.credits") ??
                utils.json.optionalNum(data.output, "$.estimates.cost[0]");
            const counts: Record<string, number> = {};
            if (credits === undefined) {
                logger.warn(
                    "topaz job completed without a billed credit figure - zero-billing",
                );
            } else counts.CREDIT = credits;
            return { counts };
        },
    },
});
