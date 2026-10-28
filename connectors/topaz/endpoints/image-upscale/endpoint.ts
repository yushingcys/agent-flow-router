import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageUpscaleBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/upscale",
    meta: {
        displayName: "Upscale Image",
        summary:
            "Gigapixel precision upscaling that preserves the source's detail and structure.",
        description: "Upscale a photo or graphic up to 32000 px per side " +
            "with Topaz Gigapixel, keeping the source's detail and " +
            "structure rather than inventing new texture. Models for " +
            "general photos, low-resolution or compressed sources, CGI and " +
            "illustration, high-resolution professional photos, and text. " +
            "Returns the job status with a presigned download link. Billed " +
            "1 credit per 24 output megapixels.",
        categories: ["image-enhancement"],
        docsUrl: "https://developer.topazlabs.com/image-models/gigapixel",
    },
    request: { method: "POST", path: "/image/v1/enhance/async" },
    input: {
        schema: {
            body: zImageUpscaleBody.extend({
                model: zImageUpscaleBody.shape.model.unwrap()
                    .default("Standard V2"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
