import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `yahoo_images` engine query parameters (https://serpapi.com/yahoo-images-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYahooImagesQuery = z.strictObject({
    p: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Yahoo! Images search.",
    ),
    yahoo_domain: z.string().describe(
        "The Yahoo! domain to use. It defaults to search.yahoo.com. If specified domain is allowed, it will be prepended to the domain (e.g., fr.search.yahoo.com). You can check a full list of supported Yahoo! domains.",
    ).optional(),
    imgsz: z.string().describe(
        "Filtering images by size. It can be set to: small - Small medium - Medium large - Large wallpaper - Extra Large",
    ).optional(),
    imgc: z.string().describe(
        "Filtering images by color. It can be set to: color - Color Only bw - Black & white red - Red color orange - Orange color yellow - Yellow color green - Green color teal - Teal color blue - Blue color purple - Purple color pink - Pink color brown - Brown color black - Black color gray - Gray color white - White color",
    ).optional(),
    imgty: z.string().describe(
        "Filtering images by image type. It can be set to: photo - Photo clipart - Clipart linedrawing - Line Drawing gif - Animated GIF transparent - Transparent",
    ).optional(),
    imga: z.string().describe(
        "Filtering images by layout. It can be set to: square - Square wide - Wide tall - Tall",
    ).optional(),
    imgf: z.string().describe(
        "Filtering images by people. It can be set to: face - Faces Only portrait - Head & Shoulders nonportrait - No People",
    ).optional(),
    imgt: z.string().describe(
        "Filtering images by time. It can be set to: day - Past 24 hours week - Past week month - Past month year - Past year",
    ).optional(),
    imgl: z.string().describe(
        "Filtering images by usage rights. It can be set to: cc - All Creative Commons pd - Public Domain fsu - Free to share and use fsuc - Free to share and use commercially fmsu - Free to modify, share and use fmsuc - Free to modify, share, and use commercially",
    ).optional(),
    b: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 1 (default) starts from the first result, 61 starts from the 61st result, 121 starts from the 121st result, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
