import { defineProvider } from "@shared/core";

/**
 * Recall.ai (recall.ai) - meeting bots that join Zoom, Google Meet,
 * Microsoft Teams and Webex calls as a participant and record them. REST at
 * `https://us-west-2.recall.ai/api/v1`, auth `Authorization: Token <key>`
 * (OpenAPI in docs.recall.ai/reference/bot_create, read 2026-10-29).
 *
 * REGION: Recall runs four separate regions (us-east-1, us-west-2,
 * eu-central-1, ap-northeast-1) and an API key only works in the region
 * whose dashboard issued it. us-west-2 is the pay-as-you-go region, the one
 * a self-serve key belongs to, so it is the baseUrl; a key from another
 * region answers 401 here.
 *
 * BILLING in US dollars at Recall's pay-as-you-go rates
 * (recall.ai/pricing, read 2026-10-29): $0.50 per hour of bot time,
 * prorated to the second, plus $0.15 per hour of recording for Recall.ai
 * transcription. Bot time runs from the first `joining_call` to `done`,
 * waiting room included; a bot that ends `fatal` is not billed
 * (docs.recall.ai/docs/calculating-usage). No response carries a dollar
 * figure, so there is no `usage.consolidate`: the derived fold is the bill.
 */
export default defineProvider({
    name: "recall",
    meta: {
        displayName: "Recall.ai",
        summary: "Meeting bots that record Zoom, Meet, Teams and Webex calls.",
        description: "Meeting bots that join Zoom, Google Meet, Microsoft " +
            "Teams and Webex calls as a participant, record them, and " +
            "return a transcript plus the audio or video. Join now or at a " +
            "scheduled time, transcribe with Recall.ai in 40+ languages or " +
            "with the platform's own captions. Billed per second of bot " +
            "time, waiting room included.",
        homepageUrl: "https://www.recall.ai",
        docsUrl: "https://docs.recall.ai",
        categories: ["meetings"],
        notes: [
            "Uses Recall's us-west-2 (pay-as-you-go) region; a key issued " +
            "in another region is rejected.",
            "Download links expire, and Recall keeps recordings 7 days by " +
            "default - download them promptly.",
        ],
    },
    auth: {
        inject: ({ data }) => ({
            ...data.request,
            headers: {
                ...data.request.headers,
                Authorization: "Token " + data.params.apiKey,
            },
        }),
    },
    request: { baseUrl: "https://us-west-2.recall.ai" },
    usage: { credits: { default: { label: "US dollars" } } },
    output: {
        /** Recall errors are DRF-style: `{detail}`, `{code, detail}` or a
         *  field map like `{meeting_url: ["..."]}`. */
        fromError: ({ data, utils }) => {
            const detail = utils.json.optionalGet(data.output, "$.detail");
            const code = utils.json.optionalGet(data.output, "$.code");
            return {
                message: typeof detail === "string" && detail !== ""
                    ? detail
                    : "Recall.ai API error",
                ...(typeof code === "string" ? { code } : {}),
                raw: data.output,
            };
        },
    },
});
