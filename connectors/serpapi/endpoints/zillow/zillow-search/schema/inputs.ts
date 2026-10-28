import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `zillow` engine query parameters (https://serpapi.com/zillow-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zZillowSearchQuery = z.strictObject({
    region_id: z.string().describe(
        "The Zillow region ID for the area you want to search in. A region can be a city, neighborhood, ZIP code, county, or state (e.g., 10221 for Austin, TX). To find a Region ID, go to Zillow, search for the area you want, and extract the number preceding _rid from the resulting URL. For example, in https://www.zillow.com/homes/10221_rid/, the Region ID is 10221. Either region_id or map_bounds should be set.",
    ).optional(),
    map_bounds: z.string().describe(
        "The GPS coordinates of the map area to search in, so only properties within these bounds are shown. Its value must be 4 comma-separated numbers matching the following format: north + , + east + , + south + , + west north and south are latitudes, and east and west are longitudes (e.g., 30.51,-97.56,30.14,-98.05 for Austin, TX). Either region_id or map_bounds should be set.",
    ).optional(),
    status_type: z.string().describe(
        "The type of properties to show. It defaults to sale. It also determines which filters are applicable. Available options: sale - For sale rent - For rent sold - Sold",
    ).optional(),
    price: z.string().describe(
        "The price range of the properties to show. Provide a single number for a minimum (e.g., 100000), or two comma-separated numbers for a min/max range (e.g., 100000,400000). To set a maximum only, omit the first number (e.g., ,400000). When status_type is sale or sold, it filters by the listing price; when status_type is rent, it filters by the monthly rent instead.",
    ).optional(),
    beds: z.string().describe(
        "The number of bedrooms. Provide a single number for a minimum (e.g., 2 for 2+ bedrooms), or two comma-separated numbers for a min/max range (e.g., 1,3). To set a maximum only, omit the first number (e.g., ,3).",
    ).optional(),
    baths: z.string().describe(
        "The number of bathrooms. Provide a single number for a minimum (e.g., 2 for 2+ bathrooms), or two comma-separated numbers for a min/max range (e.g., 1,3). To set a maximum only, omit the first number (e.g., ,3).",
    ).optional(),
    home_type: z.string().describe(
        "The types of homes to show. It's a comma-separated list acting as the complete selection: only the listed types are shown, and every other type is excluded (e.g., house,condo only shows houses and condos). To exclude a single type, list all the others (e.g., house,townhome,multi_family,condo,lot_land,manufactured to exclude apartments). When not set, all home types are shown.",
    ).optional(),
    sqft: z.string().describe(
        "The square footage of the properties to show. Provide a single number for a minimum (e.g., 1250), or two comma-separated numbers for a min/max range (e.g., 1250,3000). To set a maximum only, omit the first number (e.g., ,3000). When status_type is rent, it corresponds to Zillow's home size filter.",
    ).optional(),
    year_built: z.string().describe(
        "The year the properties were built. Provide a single year for a minimum (e.g., 2000), or two comma-separated years for a min/max range (e.g., 2000,2010). To set a maximum only, omit the first year (e.g., ,2010).",
    ).optional(),
    has_garage: z.boolean().describe(
        "Whether to only show properties with a garage. It can be set to true to only show properties with a garage, or false (default) to show all properties.",
    ).optional(),
    single_story: z.boolean().describe(
        "Whether to only show single-story properties. It can be set to true to only show single-story properties, or false (default) to show all properties.",
    ).optional(),
    age_55_plus: z.string().describe(
        "How to handle 55+ communities. It defaults to include. Available options: include - Include 55+ communities exclude - Exclude 55+ communities only - Only show 55+ communities",
    ).optional(),
    amenities: z.string().describe(
        "The amenities the properties must have. It's a comma-separated list of options (e.g., ac,pool). The available options depend on status_type.",
    ).optional(),
    view: z.string().describe(
        "The views the properties must have. It's a comma-separated list of options (e.g., city,water). Available options: city - City mountain - Mountain park - Park water - Water",
    ).optional(),
    price_reduction: z.boolean().describe(
        "Whether to only show properties with a price reduction. It can be set to true to only show properties with a price reduction, or false (default) to show all properties.",
    ).optional(),
    time_on_zillow: z.string().describe(
        "The maximum time the properties have been listed on Zillow. Provide a number of days (e.g., 14 for 14 days), or one of the supported month values: 6m, 12m, 24m, or 36m. It defaults to any time.",
    ).optional(),
    keywords: z.string().describe(
        "The keywords to filter the results by. It's a comma-separated list of keywords (e.g., yard or pool, bbq).",
    ).optional(),
    hoa_max: z.string().describe(
        "The maximum HOA (Homeowners Association) fee of the properties to show. Set it to 0 to only show properties with no HOA fee. It defaults to any HOA fee. It only applies when status_type is sale or sold.",
    ).optional(),
    parking_spots: z.string().describe(
        "The minimum number of parking spots the properties must have (e.g., 2 for 2+ parking spots). It only applies when status_type is sale or sold.",
    ).optional(),
    lot_size: z.string().describe(
        "The lot size of the properties to show, in square feet. Provide a single number for a minimum (e.g., 21780), or two comma-separated numbers for a min/max range (e.g., 21780,217800). To set a maximum only, omit the first number (e.g., ,217800). It only applies when status_type is sale or sold.",
    ).optional(),
    basement: z.string().describe(
        "The type of basement the properties must have. It's a comma-separated list of options (e.g., finished,unfinished). It only applies when status_type is sale or sold. Available options: finished - Finished unfinished - Unfinished",
    ).optional(),
    listing_type: z.string().describe(
        "The complete list of listing types to show, comma-separated: only the listed types are included, and all others are excluded. It only applies when status_type is sale. When not set, it defaults to owner,agent,new_construction,foreclosure,auction.",
    ).optional(),
    listing_status: z.string().describe(
        "The complete list of listing statuses to show, comma-separated: only the listed statuses are included, and all others are excluded. It only applies when status_type is sale. When not set, it defaults to active,coming_soon,zillow_preview. For example, to exclude Zillow previews use active,coming_soon; to also show pending listings on top of the defaults, use active,coming_soon,zillow_preview,pending.",
    ).optional(),
    tours: z.string().describe(
        "The tour options the properties must have. It's a comma-separated list of options (e.g., open_house,3d_tour). It only applies when status_type is sale. Available options: open_house - Must have open house 3d_tour - Must have 3D Tour showcase - Must have Showcase",
    ).optional(),
    space: z.string().describe(
        "The type of rental space to show. It only applies when status_type is rent. It defaults to entire_place. Available options: any - Any entire_place - Entire place room - Room for rent",
    ).optional(),
    move_in_date: z.string().describe(
        "The latest move-in date of the rentals to show: only rentals available on or before the date are shown. Provide a date in YYYY-MM-DD format (e.g., 2026-07-22). It only applies when status_type is rent. Rentals without an availability date are still shown; use hide_no_date_listings to hide them.",
    ).optional(),
    hide_no_date_listings: z.boolean().describe(
        "Whether to hide rentals that don't specify an availability date. It can be set to true to hide them, or false (default) to show them. It's meant to be used together with move_in_date, and only applies when status_type is rent.",
    ).optional(),
    pets: z.string().describe(
        "The pet policies the rentals must have. It's a comma-separated list of options (e.g., cats,small_dogs). no_pets cannot be combined with the other options. It only applies when status_type is rent. Available options: cats - Allows cats small_dogs - Allows small dogs large_dogs - Allows large dogs no_pets - No pets allowed",
    ).optional(),
    listing_features: z.string().describe(
        "The listing features the rentals must have. It's a comma-separated list of options (e.g., 3d_tour,instant_tour). It only applies when status_type is rent. Available options: 3d_tour - Must have 3D Tour accepts_applications - Accepts Zillow Applications instant_tour - Instant Tour Available",
    ).optional(),
    short_term_lease: z.boolean().describe(
        "Whether to only show rentals with a short-term lease available. It can be set to true to only show them, or false (default) to show all rentals. It only applies when status_type is rent.",
    ).optional(),
    sort_by: z.string().describe(
        "The sorting order of the results. It defaults to globalrelevanceex (Homes for You). Available options: globalrelevanceex - Homes for You featured - Verified Source priced - Price (high to low) pricea - Price (low to high) paymentd - Payment (high to low) paymenta - Payment (low to high)",
    ).optional(),
    page: z.number().describe(
        "Value is used to get results on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.).",
    ).optional(),
    ...serpApiParams,
});
