import { z } from "zod";

/** GET /brand/transaction_identifier query params - the vendor mirror of
 *  the standalone transaction lookup (context.dev SDK
 *  `brand.identifyFromTransaction`; still served beside the consolidated
 *  `POST /brand/retrieve` `by_transaction` arm, 2026-10-27). Scalar params
 *  only (design D6); `country_gl` and `force_language` are open strings
 *  here as in brand/retrieve. */
export const zTransactionIdentifierQueryParams = z.object({
    transaction_info: z.string().min(1).describe(
        "The raw card or bank statement descriptor, e.g. " +
            "'SQ *COFFEE BAR 4157...' or 'AMZN Mktp US*2K4TZ'.",
    ),
    city: z.string().describe(
        "City to prioritize when searching for the merchant.",
    ).optional(),
    country_gl: z.string().describe(
        "Country code hint (Google gl parameter) for the lookup, e.g. 'us'.",
    ).optional(),
    mcc: z.string().describe(
        "Merchant Category Code from the transaction, used to narrow the " +
            "business category.",
    ).optional(),
    phone: z.number().describe(
        "Phone number from the transaction (digits only), used to verify " +
            "the match.",
    ).optional(),
    high_confidence_only: z.boolean().describe(
        "Run an extra verification pass and only return a match " +
            "Context.dev is confident about. Default false.",
    ).optional(),
    force_language: z.string().min(2).describe(
        "Force the language of the returned brand copy (a language NAME, " +
            "e.g. 'english', 'french', 'japanese').",
    ).optional(),
    maxSpeed: z.boolean().describe(
        "Optimize for speed: Context.dev skips time-consuming enrichment for " +
            "a faster response at the cost of less comprehensive data. " +
            "Default false.",
    ).optional(),
    timeoutMS: z.number().int().min(1).max(300000).describe(
        "Request deadline in milliseconds (max 300000); a lookup past it " +
            "fails with 408 at no charge.",
    ).optional(),
}).strict();
