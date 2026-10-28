import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `bing_images` engine query parameters (https://serpapi.com/bing-images-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingImagesQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Bing Images search.",
    ),
    mkt: z.string().describe(
        "The market where the results come from (e.g. en-US). Typically, mkt is the country where the user is making the request from. However, it could be a different country if the user is not located in a country where Bing Images API delivers results. The market must be in the form <language code>-<country code>. For example, en-US. The string is case insensitive. For a list of possible market values, see Market Codes.",
    ).optional(),
    cc: z.string().describe(
        "The country to search from. It follows the 2-character ISO_3166-1 format. (e.g., us for United States, de for Germany, gb for United Kingdom, etc.).",
    ).optional(),
    first: z.number().describe(
        "Parameter controls the offset of the organic results. This parameter defaults to 1. (e.g., first=10 will move the 10th organic result to the first position).",
    ).optional(),
    count: z.number().describe(
        "Parameter controls the number of results per page. This parameter is only a suggestion and might not reflect the returned results.",
    ).optional(),
    imagesize: z.string().describe(
        "Filtering images by size. It can be set to: small - Small medium - Medium large - Large wallpaper - Extra Large",
    ).optional(),
    color2: z.string().describe(
        "Filtering images by color. It can be set to: color - Color Only bw - Black & white FGcls_RED - Red FGcls_ORANGE - Orange FGcls_YELLOW - Yellow FGcls_GREEN - Green FGcls_TEAL - Teal FGcls_BLUE - Blue FGcls_PURPLE - Purple FGcls_PINK - Pink FGcls_BROWN - Brown FGcls_BLACK - Black FGcls_GRAY - Gray FGcls_WHITE - White",
    ).optional(),
    photo: z.string().describe(
        "Filtering images by image type. It can be set to: photo - Photo clipart - Clipart linedrawing - Line Drawing animatedgif - Animated GIF animatedgifhttps - Animated GIF HTTPS transparent - Transparent shopping - Shopping, return only images that contain items where Bing knows of a merchant that is selling the items",
    ).optional(),
    aspect: z.string().describe(
        "Filtering images by layout. It can be set to: square - Square wide - Wide tall - Tall",
    ).optional(),
    face: z.string().describe(
        "Filtering images by people. It can be set to: face - Faces Only portrait - Head & Shoulders",
    ).optional(),
    age: z.string().describe(
        "Filtering images by date. It can be set to: lt1440 - Past 24 hours lt10080 - Past week lt43200 - Past month lt525600 - Past year",
    ).optional(),
    license: z.string().describe(
        "Filtering images by license. It can be set to: Type-Any - All Creative Commons L1 - Public Domain L2_L3_L4_L5_L6_L7 - Free to share and use L2_L3_L4 - Free to share and use commercially L2_L3_L5_L6 - Free to modify, share and use L2_L3 - Free to modify, share, and use commercially",
    ).optional(),
    safeSearch: z.string().describe(
        "The level of filtering for adult content. It can be set to: strict - Strict moderate - Moderate (Default) off - Off",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
