import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `autozone_product` engine query parameters
 *  (https://serpapi.com/autozone-product-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zAutozoneProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "AutoZone product to get. It is the number at the end of the product page URL (e.g., 832327 in https://www.autozone.com/p/duralast-gold-battery-24f-dlg/832327).",
    ),
    store_id: z.string().describe(
        "AutoZone store for in-store pickup availability (e.g., 4254). It is the store number shown as Store #.",
    ).optional(),
    vehicle_year: z.number().describe(
        "Vehicle year to check fitment for (e.g., 2015). Requires vehicle_make and vehicle_model. Cannot be combined with vehicle_token.",
    ).optional(),
    vehicle_make: z.string().describe(
        "Vehicle make, as named on AutoZone (e.g., Toyota). Requires vehicle_year and vehicle_model. Cannot be combined with vehicle_token.",
    ).optional(),
    vehicle_model: z.string().describe(
        "Vehicle model, as named on AutoZone (e.g., Camry). Requires vehicle_year and vehicle_make. Cannot be combined with vehicle_token.",
    ).optional(),
    vehicle_engine: z.string().describe(
        "Vehicle engine, as named on AutoZone (e.g., 4 Cylinders 2.5L GAS). Requires vehicle_year, vehicle_make, and vehicle_model. Cannot be combined with vehicle_token.",
    ).optional(),
    vehicle_submodel: z.string().describe(
        "Vehicle submodel, as named on AutoZone (e.g., LE). Without it, a product that fits only some submodels comes back as fitment needs_more_info. Requires vehicle_year, vehicle_make, and vehicle_model.",
    ).optional(),
    vehicle_type: z.string().describe(
        "Vehicle type. Default car_truck when year, make, and model are set. Options: car_truck, motorcycle, recreational. Requires vehicle_year, vehicle_make, and vehicle_model.",
    ).optional(),
    vehicle_token: z.string().describe(
        "Vehicle token from an AutoZone search (search_information.vehicle.vehicle_token). Cannot be combined with vehicle_year, vehicle_make, vehicle_model, vehicle_engine, vehicle_submodel, or vehicle_type.",
    ).optional(),
    ...serpApiParams,
});
