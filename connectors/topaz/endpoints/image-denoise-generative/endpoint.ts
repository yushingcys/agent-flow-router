import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageDenoiseGenerativeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/denoise-generative",
    meta: {
        displayName: "Denoise Image with Detail Recovery",
        summary:
            "Denoise Max: highest-quality denoising that recovers detail in soft areas.",
        description:
            "Denoise photos with Topaz Denoise Max, a generative model " +
            "that removes noise and structured grain while recovering " +
            "detail in soft areas such as skin, hair and fine texture, " +
            "with optional face enhancement. The image keeps its size. " +
            "Returns the job status with a presigned download link. " +
            "Billed 1 credit per 20 output megapixels.",
        categories: ["image-enhancement"],
        docsUrl: "https://developer.topazlabs.com/image-models/denoise/max",
    },
    request: { method: "POST", path: "/image/v1/denoise-gen/async" },
    input: {
        schema: {
            body: zImageDenoiseGenerativeBody.extend({
                model: zImageDenoiseGenerativeBody.shape.model.unwrap()
                    .default("Denoise Max"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
