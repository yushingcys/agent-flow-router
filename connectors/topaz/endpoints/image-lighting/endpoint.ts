import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageLightingBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/lighting",
    meta: {
        displayName: "Fix Image Lighting and Color",
        summary:
            "Exposure, white balance, colorization and creative relighting for photos.",
        description:
            "Fix a photo's light and color with Topaz: automatic exposure " +
            "and contrast correction, white balance, colorization of " +
            "black-and-white photos, or generative creative relighting. " +
            "The image keeps its size. Returns the job status with a " +
            "presigned download link. Billed 1 credit per 24 output " +
            "megapixels (Relight Creative: 1 per 4).",
        categories: ["image-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/image-models/color-and-lighting",
    },
    request: { method: "POST", path: "/image/v1/lighting/async" },
    input: {
        schema: {
            body: zImageLightingBody.extend({
                model: zImageLightingBody.shape.model.unwrap()
                    .default("Adjust"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
