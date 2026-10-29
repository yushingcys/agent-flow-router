import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { personNotes, zPersonEnrichBody } from "../../schema/person.ts";

/** POST /person/enrich billed as the Person Base (PII) product (provider docs). */
export default defineEndpoint({
    meta: {
        displayName: "Person Base (PII)",
        summary:
            "Professional profile plus emails, phones, location, age and sex.",
        description:
            "Person Base enrichment with contact data: the Base professional profile (current job, company, work history, education, skills, socials) plus emails, phones, personal location, birth date, age and sex. Excludes Premium attributes such as seniority, job function and tenure.",
        docsUrl:
            "https://www.datalegion.ai/docs/api-reference/person-enrichment",
        categories: ["people-enrichment"],
        notes: [
            ...personNotes,
            "The API key's account must hold the Person Base (PII) product: the " +
            "response carries that account product's fields and draws " +
            "its credits.",
        ],
    },
    endpoint: "/person/enrich/base/pii",
    request: { method: "POST", path: "/person/enrich" },
    input: { schema: { body: zPersonEnrichBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "records returned",
            consumes: { credit: "person_base_contact", amount: 1 },
        },
    },
});
