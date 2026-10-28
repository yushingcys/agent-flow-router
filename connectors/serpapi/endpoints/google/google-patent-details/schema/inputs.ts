import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_patents_details` engine query parameters (https://serpapi.com/google-patents-details-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGooglePatentDetailsQuery = z.strictObject({
    patent_id: z.string().min(1).describe(
        "The ID of the patent you want to retrieve. You can get it from the results of our Google Patents API. It can be: - A patent ID: patent/<publication number>/<two-letter country code>, the country code can be omitted (e.g. patent/US11734097B1/en or patent/US11734097B1) - A scholar ID: scholar/<scholar ID> (e.g. scholar/6497879044063343659)",
    ),
    ...serpApiParams,
});
