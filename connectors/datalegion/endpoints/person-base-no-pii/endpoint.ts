import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { personNotes, zPersonEnrichBody } from "../../schema/person.ts";

/** POST /person/enrich billed as the Person Base (No PII) product (provider docs). */
export default defineEndpoint({
    meta: {
        displayName: "Person Base (No PII)",
        summary:
            "Professional profile: current job, company, work history, education and skills; no contact data.",
        description:
            "Person Base enrichment without contact data: name, headline, summary, current job and company, work history, education, skills, languages and social profiles. Excludes Premium attributes and the contact / demographic group (emails, phones, location, age, sex).",
        docsUrl:
            "https://www.datalegion.ai/docs/api-reference/person-enrichment",
        categories: ["people-enrichment"],
        notes: [
            ...personNotes,
            "The API key's account must hold the Person Base (No PII) product: the " +
            "response carries that account product's fields and draws " +
            "its credits.",
        ],
    },
    endpoint: "/person/enrich/base/no-pii",
    request: { method: "POST", path: "/person/enrich" },
    input: { schema: { body: zPersonEnrichBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "records returned",
            consumes: { credit: "person_base", amount: 1 },
        },
    },
});
