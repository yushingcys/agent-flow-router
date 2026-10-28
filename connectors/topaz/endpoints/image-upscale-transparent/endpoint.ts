import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageUpscaleTransparentBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/upscale-transparent",
    meta: {
        displayName: "Upscale Transparent PNG",
        summary:
            "Upscaling that keeps the alpha channel of transparent PNGs intact.",
        description: "Upscale a transparent PNG (logos, cut-out products, " +
            "stickers, game assets) while keeping its alpha channel " +
            "clean, which ordinary upscalers flatten. Output is always " +
            "PNG. Returns the job status with a presigned download link. " +
            "Billed 1 credit per 24 output megapixels.",
        categories: ["image-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/image-models/gigapixel/transparent-image-upscale",
    },
    request: { method: "POST", path: "/image/v1/tool/async" },
    input: {
        schema: {
            body: zImageUpscaleTransparentBody.extend({
                model: zImageUpscaleTransparentBody.shape.model.unwrap()
                    .default("Transparency Upscale"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
