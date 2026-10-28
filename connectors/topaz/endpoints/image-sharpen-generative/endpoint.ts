import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageSharpenGenerativeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/sharpen-generative",
    meta: {
        displayName: "Recover Focus in Blurry Image",
        summary:
            "Super Focus generative deblurring that reconstructs detail in severely blurred photos.",
        description:
            "Recover severely out-of-focus or blurred photos with Topaz " +
            "Super Focus, a generative model that reconstructs the detail " +
            "ordinary sharpening cannot. The image keeps its size. " +
            "Returns the job status with a presigned download link. " +
            "Billed 1 credit per 20 output megapixels; slower than the " +
            "standard sharpen models.",
        categories: ["image-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/image-models/sharpen/super-focus-3",
    },
    request: { method: "POST", path: "/image/v1/sharpen-gen/async" },
    input: {
        schema: {
            body: zImageSharpenGenerativeBody.extend({
                model: zImageSharpenGenerativeBody.shape.model.unwrap()
                    .default("Super Focus V2"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
