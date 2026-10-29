import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { personNotes, zPersonEnrichBody } from "../../schema/person.ts";

/** POST /person/enrich billed as the Person Premium (No PII) product (provider docs). */
export default defineEndpoint({
    meta: {
        displayName: "Person Premium (No PII)",
        summary:
            "Professional profile plus seniority, job function, decision-maker flag, experience and tenure; no contact data.",
        description:
            "Person Premium enrichment without contact data: the Base profile plus seniority, job function, decision-maker and platform-worker flags, expense category, years of experience, tenure, highest degree, certifications, field confidence levels and freshness indicators. Excludes emails, phones, location, age and sex.",
        docsUrl:
            "https://www.datalegion.ai/docs/api-reference/person-enrichment",
        categories: ["people-enrichment"],
        notes: [
            ...personNotes,
            "The API key's account must hold the Person Premium (No PII) product: the " +
            "response carries that account product's fields and draws " +
            "its credits.",
        ],
    },
    endpoint: "/person/enrich/premium/no-pii",
    request: { method: "POST", path: "/person/enrich" },
    input: { schema: { body: zPersonEnrichBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "records returned",
            consumes: { credit: "person_premium", amount: 1 },
        },
    },
});
