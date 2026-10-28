import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageRemoveBackgroundBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/remove-background",
    meta: {
        displayName: "Remove Image Background",
        summary:
            "Background removal and subject matting with a transparent PNG output.",
        description:
            "Remove the background from a photo with Topaz, keeping fine " +
            "edges such as hair and semi-transparent elements, and get " +
            "the subject as a transparent PNG. Suited to product photos " +
            "and e-commerce. Returns the job status with a presigned " +
            "download link. Billed 1 credit per 24 output megapixels.",
        categories: ["image-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/image-models/removal-and-cleanup/background-removal",
    },
    request: { method: "POST", path: "/image/v1/matting/async" },
    input: {
        schema: {
            body: zImageRemoveBackgroundBody.extend({
                model: zImageRemoveBackgroundBody.shape.model.unwrap()
                    .default("RemoveBG"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
