import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageDenoiseBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/denoise",
    meta: {
        displayName: "Denoise Image",
        summary:
            "Noise and grain reduction in three strengths for low-light and high-ISO photos.",
        description:
            "Remove noise and grain from low-light or high-ISO photos " +
            "with Topaz Denoise at a Normal, Strong or Extreme strength. " +
            "The image keeps its size. Returns the job status with a " +
            "presigned download link. Billed 1 credit per 24 output " +
            "megapixels.",
        categories: ["image-enhancement"],
        docsUrl: "https://developer.topazlabs.com/image-models/denoise",
    },
    request: { method: "POST", path: "/image/v1/denoise/async" },
    input: {
        schema: {
            body: zImageDenoiseBody.extend({
                model: zImageDenoiseBody.shape.model.unwrap()
                    .default("Normal"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
