import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `autozone` engine query parameters (https://serpapi.com/autozone-search-api,
 *  read 2026-11-27). Mirror carries optionality only (D25). */
export const zAutozoneSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular AutoZone search (e.g., oil filter, brake pads, or a part number like S9972).",
    ),
    store_id: z.string().describe(
        "AutoZone store to search (e.g., 4254). It changes result order and adds in_store_pickup. Default 6997, the store AutoZone uses when none is selected.",
    ).optional(),
    vehicle_year: z.number().describe(
        "Vehicle year to find parts for (e.g., 2015). Requires vehicle_make and vehicle_model.",
    ).optional(),
    vehicle_make: z.string().describe(
        "Vehicle make, as named on AutoZone (e.g., Toyota). Requires vehicle_year and vehicle_model.",
    ).optional(),
    vehicle_model: z.string().describe(
        "Vehicle model, as named on AutoZone (e.g., Camry). Requires vehicle_year and vehicle_make.",
    ).optional(),
    vehicle_engine: z.string().describe(
        "Vehicle engine, as named on AutoZone (e.g., 4 Cylinders 2.5L GAS). Requires vehicle_year, vehicle_make, and vehicle_model.",
    ).optional(),
    vehicle_submodel: z.string().describe(
        "Vehicle submodel, as named on AutoZone (e.g., LE). Without it, parts that fit only some submodels come back as fitment needs_more_info. Requires vehicle_year, vehicle_make, and vehicle_model.",
    ).optional(),
    vehicle_type: z.string().describe(
        "Vehicle type. Default car_truck when year, make, and model are set. Options: car_truck, motorcycle, recreational. Requires vehicle_year, vehicle_make, and vehicle_model.",
    ).optional(),
    sort: z.string().describe(
        "Sort order. Default featured. Options: featured, price_low, price_high, recently_added, rating_high, best_seller.",
    ).optional(),
    facet: z.string().describe(
        "Filters to apply, as a comma-separated list of filter values from filters[].options[].value when include_filters is true.",
    ).optional(),
    min_price: z.number().describe(
        "Minimum price, in whole US dollars.",
    ).optional(),
    max_price: z.number().describe(
        "Maximum price, in whole US dollars.",
    ).optional(),
    page: z.number().describe(
        "Page of results. 1 (default) is the first page.",
    ).optional(),
    ps: z.number().describe(
        "Results per page, from 1 to 100. Default 24.",
    ).optional(),
    include_filters: z.boolean().describe(
        "Include filters in the response, with the values to use in facet. true, or false (default).",
    ).optional(),
    ...serpApiParams,
});
