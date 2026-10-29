import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { personNotes, zPersonEnrichBody } from "../../schema/person.ts";

/** POST /person/enrich billed as the Person Premium (PII) product (provider docs). */
export default defineEndpoint({
    meta: {
        displayName: "Person Premium (PII)",
        summary:
            "Every person field: Premium professional attributes plus emails, phones and location.",
        description:
            "Person Premium enrichment with contact data: every person field - the Base profile, Premium attributes (seniority, job function, decision-maker flag, experience, tenure, certifications, confidence levels) and contact / demographic data (emails, phones, location, birth date, age, sex).",
        docsUrl:
            "https://www.datalegion.ai/docs/api-reference/person-enrichment",
        categories: ["people-enrichment"],
        notes: [
            ...personNotes,
            "The API key's account must hold the Person Premium (PII) product: the " +
            "response carries that account product's fields and draws " +
            "its credits.",
        ],
    },
    endpoint: "/person/enrich/premium/pii",
    request: { method: "POST", path: "/person/enrich" },
    input: { schema: { body: zPersonEnrichBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "records returned",
            consumes: { credit: "person_premium_contact", amount: 1 },
        },
    },
});
