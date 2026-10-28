import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `yelp_place` engine query parameters (https://serpapi.com/yelp-place,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYelpPlaceQuery = z.strictObject({
    place_id: z.string().min(1).describe(
        "The Yelp ID of a place. Each place has two unique IDs (e.g. ED7A7vDdg8yLNKJTSVHHmg and arabica-brooklyn) and you can use either of them as a value of the place_id. To extract the IDs of a place you can use our Yelp Search API.",
    ),
    yelp_domain: z.string().describe(
        "The Yelp domain to use. It defaults to yelp.com.",
    ).optional(),
    business_alert: z.boolean().describe(
        "Set parameter to true to include business alert information when available. It defaults to false.",
    ).optional(),
    full_menu: z.boolean().describe(
        "Set parameter to true to scrape business full menu when available. It defaults to false. When the parameter full_menu is set to true, but the business queried doesn't have a full menu page, then place_results will be returned instead of full_menu_results. This information will also be returned in search_information and error keys in the json response.",
    ).optional(),
    menu_name: z.string().describe(
        "The name of which Full Menu to scrape when more than one Full Menu is available. It can only be used in combination with full_menu parameter.",
    ).optional(),
    ...serpApiParams,
});
