import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `bing_reverse_image` engine query parameters (https://serpapi.com/bing-reverse-image-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingReverseImageQuery = z.strictObject({
    image_url: z.string().min(1).describe(
        "The URL for an image to perform the reverse image search. NOTE: The image's width and height must each be 4,000 pixels or less.",
    ),
    mkt: z.string().describe(
        "The market where the results come from (e.g. en-US). Typically, mkt is the country where the user is making the request from. However, it could be a different country if the user is not located in a country where Bing Reverse Image API delivers results. The market must be in the form <language code>-<country code>. For example, en-US. The string is case insensitive.",
    ).optional(),
    cat: z.string().describe(
        "Parameter is used to crop the image and perform the reverse search on the cropped part of the image. For example, 0.3 means cropping 30% from the top. The minimum and maximum for this coordinate are 0 and 1, respectively.",
    ).optional(),
    cal: z.string().describe(
        "Parameter is used to crop the image and perform the reverse search on the cropped part of the image. For example, 0.3 means cropping 30% from the left. The minimum and maximum for this coordinate are 0 and 1, respectively.",
    ).optional(),
    car: z.string().describe(
        "Parameter is used to crop the image and perform the reverse search on the cropped part of the image. For example, 0.8 means cropping the right, 80% from the left. The minimum and maximum for this coordinate are 0 and 1, respectively.",
    ).optional(),
    cab: z.string().describe(
        "Parameter is used to crop the image and perform the reverse search on the cropped part of the image. For example, 0.8 means cropping the bottom, 80% from the top. The minimum and maximum for this coordinate are 0 and 1, respectively.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results.",
    ).optional(),
    count: z.number().describe(
        "Parameter controls the number of results per page. This parameter defaults to 35. This parameter is only a suggestion and might not reflect the returned results. The minimum and maximum for this parameter are 0 and 150, respectively.",
    ).optional(),
    ...serpApiParams,
});
