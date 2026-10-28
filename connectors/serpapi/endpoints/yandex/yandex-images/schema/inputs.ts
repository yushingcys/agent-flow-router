import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `yandex_images` engine query parameters (https://serpapi.com/yandex-images-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYandexImagesQuery = z.strictObject({
    text: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Yandex Images search. It can be optional if the url parameter is being used.",
    ),
    yandex_domain: z.string().describe(
        "The Yandex Images domain to use. It defaults to yandex.com.",
    ).optional(),
    width: z.string().describe(
        "The width of an image. It can only be used in combination with height parameter.",
    ).optional(),
    height: z.string().describe(
        "The height of an image. It can only be used in combination with width parameter.",
    ).optional(),
    file_type: z.string().describe(
        "Filtering images by file type. It can be set to: jpg - JPG file extension png - PNG file extension gifan - GIF file extension",
    ).optional(),
    color: z.string().describe(
        "Filtering images by color. It can be set to: color - Color images only gray - Black and white red - Red color orange - Orange color yellow - Yellow color cyan - Cyan color green - Green color blue - Blue color violet - Violet color white - White color black - Black color",
    ).optional(),
    orientation: z.string().describe(
        "Filtering images by orientation. It can be set to: horizontal - Horizontal vertical - Vertical square - Square",
    ).optional(),
    image_type: z.string().describe(
        "Filtering images by image type. It can be set to: photo - Photograph clipart - White background lineart - Drawings and sketches demotivator - Demotivator face - People",
    ).optional(),
    site: z.string().describe(
        "Filtering images by their source. Example value: www.shutterstock.com.",
    ).optional(),
    recent: z.string().describe(
        "Showing images that appeared in the last 7 days.",
    ).optional(),
    family_mode: z.string().describe(
        "Parameter enables or disables Family Mode (safe search). It can be set to: - Off(0) - Moderate(1) - Strict(2). It defaults to Moderate(1).",
    ).optional(),
    url: z.string().describe(
        "The URL for an image to perform the reverse image search.",
    ).optional(),
    crop: z.string().describe(
        "Parameter is used to crop the image and perform the reverse search on the cropped part of the image. E.g. 0.04;0.46;0.27;0.84. These coordinates are formatted in the next order: left edge;top edge;right edge;bottom edge. The minimum and maximum for each coordinate are 0 and 1, respectively.",
    ).optional(),
    crop_id: z.string().describe(
        "Parameter is used to filter results by a specific section of an image. Parameter will only work with images uploaded by Yandex (e.g. https://avatars.mds.yandex.net/rest-of-the-image-url). crop and crop_id parameters should not be used together.",
    ).optional(),
    tab: z.string().describe(
        "The specific tab for the reverse image search. Yandex defaults to the 'About the image' tab. It can be set to: about - 'About the image' tab results similar - 'Similar images' tab results.",
    ).optional(),
    p: z.number().describe(
        "The page number. Pagination starts from 0, and it can return up to 30 results.",
    ).optional(),
    ...serpApiParams,
});
