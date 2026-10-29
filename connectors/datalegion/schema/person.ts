import { z } from "zod";
import { zEnrichOptions } from "./common.ts";

/** POST /person/enrich body (OpenAPI `EnrichmentRequest`). */
export const zPersonEnrichBody = z.object({
    email: z.string().describe("Email address (primary identifier).")
        .optional(),
    email_hash: z.string().describe(
        "SHA-256, SHA-1 or MD5 hash of the normalized email (primary identifier).",
    ).optional(),
    phone: z.string().describe("Phone number (primary identifier).")
        .optional(),
    linkedin_id: z.string().describe(
        "LinkedIn numeric ID (primary identifier).",
    ).optional(),
    social_url: z.string().describe(
        "Social profile URL: LinkedIn, X/Twitter, GitHub, Facebook (primary identifier).",
    ).optional(),
    legion_id: z.string().describe("Data Legion person ID (exact match).")
        .optional(),
    full_name: z.string().describe("Full name (needs a context field).")
        .optional(),
    first_name: z.string().describe("First name (needs a context field).")
        .optional(),
    last_name: z.string().describe("Last name (needs a context field).")
        .optional(),
    address: z.string().describe("Full address string (context).")
        .optional(),
    city: z.string().describe("City (context).").optional(),
    state: z.string().describe("State name or code (context).").optional(),
    country: z.string().describe("Country name or code (context).")
        .optional(),
    postal_code: z.string().describe("Postal / ZIP code (context).")
        .optional(),
    job_title: z.string().describe("Job title (context).").optional(),
    company: z.string().describe(
        "Company name, website or social URL (context).",
    ).optional(),
    school: z.string().describe(
        "School name, website or social URL (context).",
    ).optional(),
    birth_date: z.string().describe(
        "Birth date YYYY-MM-DD, YYYY-MM or YYYY (context or qualifier).",
    ).optional(),
    ...zEnrichOptions,
}).strict();

export const personNotes = [
    "Send a primary identifier (email, email_hash, phone, social_url, " +
    "linkedin_id, legion_id) or a name (first_name, last_name or " +
    "full_name) plus at least one context field (city, state, country, " +
    "postal_code, address, company, school, job_title, birth_date); " +
    "anything less answers 400.",
];
