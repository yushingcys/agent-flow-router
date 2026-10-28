import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageSharpenBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/sharpen",
    meta: {
        displayName: "Sharpen Image",
        summary:
            "Sharpening models tuned per blur type: lens, motion, focus, portrait, wildlife.",
        description:
            "Sharpen a blurry photo with a Topaz model matched to the " +
            "cause: lens or focus blur, camera or subject motion, soft " +
            "portraits, wildlife detail, or a general and a strong mode. " +
            "The image keeps its size. Returns the job status with a " +
            "presigned download link. Billed 1 credit per 24 output " +
            "megapixels.",
        categories: ["image-enhancement"],
        docsUrl: "https://developer.topazlabs.com/image-models/sharpen",
    },
    request: { method: "POST", path: "/image/v1/sharpen/async" },
    input: {
        schema: {
            body: zImageSharpenBody.extend({
                model: zImageSharpenBody.shape.model.unwrap()
                    .default("Standard"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
