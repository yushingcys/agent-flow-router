import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `tripadvisor_place` engine query parameters (https://serpapi.com/tripadvisor-place-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zTripadvisorPlaceQuery = z.strictObject({
    place_id: z.string().min(1).describe(
        "The Tripadvisor place ID. To extract the ID of a place, you can use our Tripadvisor Search API. NOTE: Tripadvisor has discontinued support for Vacation Rentals. As a result, requesting details for a Vacation Rental place_id may return incomplete data or no data at all.",
    ),
    tripadvisor_domain: z.string().describe(
        "The Tripadvisor domain to use. It defaults to tripadvisor.com.",
    ).optional(),
    ...serpApiParams,
});
