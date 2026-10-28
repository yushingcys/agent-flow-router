import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageUpscaleGenerativeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/upscale-generative",
    meta: {
        displayName: "Upscale Image with Realistic Detail",
        summary:
            "Wonder generative upscaling that restores realistic detail in low-resolution or compressed photos.",
        description:
            "Upscale low-resolution, compressed or degraded photos with " +
            "Topaz Wonder, a generative model that reconstructs realistic " +
            "faces, textures and text instead of only sharpening what is " +
            "there. Choose Wonder 3.5, 3, 2 or 1, Standard MAX, or the " +
            "Recover models. Returns the job status with a presigned " +
            "download link. Billed 1 credit per 4 output megapixels (8 " +
            "for Wonder 3 and 3.5).",
        categories: ["image-enhancement"],
        docsUrl: "https://developer.topazlabs.com/image-models/wonder",
    },
    request: { method: "POST", path: "/image/v1/enhance-gen/async" },
    input: {
        schema: {
            body: zImageUpscaleGenerativeBody.extend({
                model: zImageUpscaleGenerativeBody.shape.model.unwrap()
                    .default("Wonder 3.5"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
