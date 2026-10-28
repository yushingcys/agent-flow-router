import { defineEndpoint } from "@shared/core";
import { creditModel } from "../../schema/credits.ts";
import { estimateImage, pollImage, startImage } from "../../schema/image.ts";
import { zImageRestoreBody } from "./schema/inputs.ts";

export default defineEndpoint({
    endpoint: "/image/restore",
    meta: {
        displayName: "Restore Old Photo",
        summary:
            "Generative restoration: dust and scratch cleanup for scans, face recovery for old portraits.",
        description: "Restore old or damaged photos with Topaz's generative " +
            "restoration models: clean dust, scratches and blemishes from " +
            "scanned prints, or recover faces in low-resolution and aged " +
            "portraits. The image keeps its size. Returns the job status " +
            "with a presigned download link. Billed 1 credit per 24 " +
            "output megapixels.",
        categories: ["image-enhancement"],
        docsUrl:
            "https://developer.topazlabs.com/image-models/removal-and-cleanup/dust-and-scratch-2",
    },
    request: { method: "POST", path: "/image/v1/restore-gen/async" },
    input: {
        schema: {
            body: zImageRestoreBody.extend({
                model: zImageRestoreBody.shape.model.unwrap()
                    .default("Dust-Scratch"),
            }),
        },
    },
    lifecycle: { start: startImage, poll: pollImage },
    usage: { model: creditModel, estimate: estimateImage },
});
