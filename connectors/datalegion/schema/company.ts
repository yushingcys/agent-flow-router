import { z } from "zod";
import { zEnrichOptions } from "./common.ts";

/** POST /company/enrich body (OpenAPI `CompanyEnrichmentRequest`). */
export const zCompanyEnrichBody = z.object({
    legion_id: z.string().describe("Data Legion company ID (exact match).")
        .optional(),
    domain: z.string().describe("Company website domain, e.g. stripe.com.")
        .optional(),
    name: z.string().describe("Company name (fuzzy matching).").optional(),
    linkedin_id: z.string().describe("LinkedIn company numeric ID.")
        .optional(),
    social_url: z.string().describe(
        "LinkedIn company page or other social URL (Facebook, Crunchbase, X, GitHub).",
    ).optional(),
    ticker_symbol: z.string().describe("Stock ticker symbol, e.g. GOOGL.")
        .optional(),
    industry: z.string().describe(
        "Industry qualifier that narrows name matching, e.g. 'software development'.",
    ).optional(),
    ...zEnrichOptions,
}).strict();

export const companyNotes = [
    "Send at least one identifier (legion_id, domain, name, linkedin_id, " +
    "social_url, ticker_symbol); industry alone answers 400.",
];
