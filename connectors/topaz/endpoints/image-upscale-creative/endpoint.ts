import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageUpscaleCreativeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/upscale-creative",
    meta: {
        displayName: "Upscale Image with Creative Detail",
        summary:
            "Bloom creative upscaling that invents new detail and texture in AI-generated images.",
        description:
            "Upscale AI-generated images, artwork and illustrations with " +
            "Topaz Bloom, which reimagines them with new detail and " +
            "texture rather than reproducing the source faithfully. Bloom " +
            "2 takes an optional prompt and a creativity level. Returns " +
            "the job status with a presigned download link. Billed 1 " +
            "credit per 2 output megapixels, the most expensive image " +
            "family.",
        categories: ["image-enhancement"],
        docsUrl: "https://developer.topazlabs.com/image-models/bloom",
    },
    request: { method: "POST", path: "/image/v1/enhance-gen/async" },
    input: {
        schema: {
            body: zImageUpscaleCreativeBody.extend({
                model: zImageUpscaleCreativeBody.shape.model.unwrap()
                    .default("Bloom 2"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
