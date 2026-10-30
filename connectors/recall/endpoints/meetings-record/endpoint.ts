import { z } from "zod";
import { defineEndpoint, type Json, Unit, UsageModelKind } from "@shared/core";

/**
 * Record a meeting with a Recall.ai bot: ONE run per bot, as long as the
 * meeting. `POST /api/v1/bot/` creates the bot (now, or at `join_at`); poll
 * `GET /api/v1/bot/{id}/` until the bot is `done` and its recording
 * artifacts have finished processing; settle on the bot's own timeline.
 * Stop leaves the call (or deletes a bot that has not started).
 *
 * The body is a curated surface (Monid's), not Recall's full BotRequest:
 * `start` builds `recording_config` and `automatic_leave` from it. Recall
 * has no idempotency key, so a retried start tick can create a second bot
 * (known gap, as with kling).
 */
export const zRecordBody = z.object({
    meeting_url: z.string()
        .regex(/^https:\/\/\S+$/, "must be an https:// meeting link")
        .describe(
            "The Zoom, Google Meet, Microsoft Teams or Webex meeting link, " +
                "for example https://zoom.us/j/123?pwd=456.",
        ),
    bot_name: z.string().min(1).max(100).describe(
        'Name shown in the call. Recall defaults to "Meeting Notetaker".',
    ).optional(),
    join_at: z.iso.datetime({ offset: true }).describe(
        "ISO 8601 time to join, up to 7 days ahead. At least 10 minutes " +
            "ahead guarantees an on-time join; omit to join now.",
    ).optional(),
    transcript_model: z.enum(["recallai", "captions"]).describe(
        "recallai: Recall.ai transcription in 40+ languages ($0.15 per " +
            "recorded hour on top of bot time), ready a few minutes after " +
            "the call. captions: the meeting platform's own closed " +
            "captions, no extra charge. Defaults to recallai.",
    ).optional(),
    language_code: z.string().describe(
        "Transcript language, such as `en`; recallai defaults to auto " +
            "detection, captions to the platform's choice.",
    ).optional(),
    video: z.boolean().describe(
        "true: record mixed video (MP4). false (default): mixed audio only " +
            "(MP3).",
    ).optional(),
    max_duration_minutes: z.number().int().min(1).max(1440).describe(
        "Leave after this many minutes of recording. Caps the bill.",
    ),
    waiting_room_timeout_minutes: z.number().int().min(1).max(120).describe(
        "Leave if not admitted from the waiting room within this many " +
            "minutes (billed bot time). Recall defaults to 20.",
    ).optional(),
}).strict();

const s = zRecordBody.shape;

export default defineEndpoint({
    meta: {
        displayName: "Recall.ai Record Meeting",
        summary:
            "Send a bot into a Zoom, Meet, Teams or Webex meeting; get the transcript and recording.",
        description: "Join a live or scheduled meeting with a recording " +
            "bot and capture it until it ends. Returns `transcript_url` " +
            "(JSON words with speaker, start and end times), `media_url` " +
            "(MP3 by default, MP4 with video=true), the `platform`, why the " +
            "bot left (`leave_reason`), and the bot's `status_changes`. " +
            "Joins now or at `join_at`; `max_duration_minutes` caps the " +
            "recording; transcribe with Recall.ai or the platform's own " +
            "captions. Stop the run to make the bot leave (or cancel a " +
            "scheduled one). $0.50 per hour of bot time, waiting room " +
            "included, plus $0.15 per recorded hour for Recall.ai " +
            "transcription. Suited for meeting notes, summaries, sales-call " +
            "analysis and interview transcripts.",
        docsUrl: "https://docs.recall.ai/reference/bot_create",
        categories: ["meetings"],
        notes: [
            "The run lasts as long as the meeting (plus the wait for a " +
            "scheduled join_at), then a few minutes while Recall.ai " +
            "transcription finishes.",
            "Zoom hosts must accept the bot's recording request; a denied " +
            "request makes the bot leave after 30 seconds (still billed).",
            "Instant joins can fail with HTTP 507 when Recall's ad-hoc bot " +
            "pool is empty; retry after a few minutes, or schedule with " +
            "join_at at least 10 minutes ahead.",
            "The hold prices max_duration_minutes plus the waiting-room " +
            "timeout; the bill is the bot's actual time.",
        ],
    },
    endpoint: "/meetings/record",
    request: { method: "POST", path: "/api/v1/bot/" },
    input: {
        schema: {
            body: zRecordBody.extend({
                transcript_model: s.transcript_model.unwrap()
                    .default("recallai"),
                video: s.video.unwrap().default(false),
                waiting_room_timeout_minutes: s.waiting_room_timeout_minutes
                    .unwrap().default(20),
            }),
        },
    },
    // 7 days of scheduling + a day-long meeting + transcription
    timeouts: { requestMs: 30_000, runMs: 691_200_000, pollMs: 60_000 },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                bot_time: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.5 / 3600 },
                    label: "bot seconds",
                    description: "$0.50 per hour, joining_call to done",
                },
                transcription: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.15 / 3600 },
                    label: "Recall.ai transcription seconds",
                    description: "$0.15 per hour of recording",
                },
            },
        },
        estimate: ({ data }) => {
            const b = data.input.body;
            const recorded = b.max_duration_minutes * 60;
            return {
                counts: {
                    bot_time: recorded + b.waiting_room_timeout_minutes * 60,
                    ...(b.transcript_model === "recallai"
                        ? { transcription: recorded }
                        : {}),
                },
            };
        },
        /** Bot time = first `joining_call` to `done` (Recall's own rule);
         *  transcription = each recording's started_at to completed_at.
         *  ISO timestamps are parsed by hand: `Date` is not a closed-term
         *  global. */
        evidence: ({ data, utils }) => {
            const $ = utils.json;
            const changes = $.optionalGet(data.output, "$.status_changes");
            const events = (Array.isArray(changes) ? changes : []).map((e) =>
                e !== null && typeof e === "object" && !Array.isArray(e)
                    ? [String(e.code ?? ""), String(e.created_at ?? "")]
                    : ["", ""]
            );
            const joined = events.find((e) => e[0] === "joining_call");
            const done = events.find((e) => e[0] === "done");
            const recs = $.optionalGet(data.output, "$.recordings");
            const spans = (Array.isArray(recs) ? recs : []).map((r) =>
                r !== null && typeof r === "object" && !Array.isArray(r)
                    ? [String(r.started_at ?? ""), String(r.completed_at ?? "")]
                    : ["", ""]
            );
            const seconds = [
                [joined?.[1] ?? "", done?.[1] ?? ""],
                ...spans,
            ].map((pair) => {
                const t = pair.map((ts) => {
                    const m =
                        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:?\d{2})?$/
                            .exec(ts);
                    if (m === null) return Number.NaN;
                    const mo = Number(m[2]);
                    const y = Number(m[1]) - (mo <= 2 ? 1 : 0);
                    const era = Math.floor(y / 400);
                    const yoe = y - era * 400;
                    const doy = Math.floor(
                        (153 * (mo + (mo > 2 ? -3 : 9)) + 2) / 5,
                    ) + Number(m[3]) - 1;
                    const doe = yoe * 365 + Math.floor(yoe / 4) -
                        Math.floor(yoe / 100) + doy;
                    const tz = m[7] ?? "Z";
                    const offset = tz === "Z" ? 0 : (tz[0] === "-" ? -1 : 1) *
                        (Number(tz.slice(1, 3)) * 3600 +
                            Number(tz.slice(-2)) * 60);
                    return (era * 146097 + doe - 719468) * 86400 +
                        Number(m[4]) * 3600 + Number(m[5]) * 60 +
                        Number(m[6]) - offset;
                });
                return Number.isFinite(t[0]) && Number.isFinite(t[1]) &&
                        t[1] > t[0]
                    ? Math.round(t[1] - t[0])
                    : 0;
            });
            const transcribed = data.input.body.transcript_model ===
                    "recallai"
                ? seconds.slice(1).reduce((a, b) => a + b, 0)
                : 0;
            return {
                counts: {
                    bot_time: seconds[0],
                    ...(transcribed > 0 ? { transcription: transcribed } : {}),
                },
            };
        },
    },
    output: {
        /** The bot record, reduced to what a caller acts on. Download
         *  links are null until Recall has them (or when not requested). */
        fromResponse: ({ data, utils }) => {
            const $ = utils.json;
            const o = data.output;
            const str = [
                "$.id",
                "$.meeting_url.platform",
                "$.recordings[0].media_shortcuts.transcript.data.download_url",
                "$.recordings[0].media_shortcuts.video_mixed.data.download_url",
                "$.recordings[0].media_shortcuts.audio_mixed.data.download_url",
                "$.recordings[0].expires_at",
            ].map((path) => {
                const v = $.optionalGet(o, path);
                return typeof v === "string" ? v : null;
            });
            const changes = $.optionalGet(o, "$.status_changes");
            const events = Array.isArray(changes) ? changes : [];
            const last = events[events.length - 1];
            const lastObj = last !== null && typeof last === "object" &&
                    !Array.isArray(last)
                ? last
                : {};
            return {
                bot_id: str[0],
                platform: str[1],
                status: typeof lastObj.code === "string" ? lastObj.code : null,
                leave_reason: typeof lastObj.sub_code === "string"
                    ? lastObj.sub_code
                    : null,
                transcript_url: str[2],
                media_url: str[3] ?? str[4],
                recording_expires_at: str[5],
                status_changes: events,
            } as Json;
        },
    },
    lifecycle: {
        /** START: create the bot. Non-2xx is DATA (no bot, no charge:
         *  400 bad link, 507 empty ad-hoc pool); a 2xx without an id is a
         *  deterministic contract breach. */
        start: async ({ data, utils }) => {
            const b = data.input.body;
            const lang = Object.fromEntries(
                b.language_code !== undefined
                    ? [["language_code", b.language_code]]
                    : [],
            );
            const res = await utils.http({
                method: "POST",
                path: "/api/v1/bot/",
                body: {
                    meeting_url: b.meeting_url,
                    ...(b.bot_name !== undefined
                        ? { bot_name: b.bot_name }
                        : {}),
                    ...(b.join_at !== undefined ? { join_at: b.join_at } : {}),
                    recording_config: {
                        transcript: {
                            provider: b.transcript_model === "captions"
                                ? { meeting_captions: lang }
                                : {
                                    recallai_streaming: {
                                        mode: "prioritize_accuracy",
                                        ...lang,
                                    },
                                },
                        },
                        ...(b.video
                            ? {}
                            : { video_mixed_mp4: null, audio_mixed_mp3: {} }),
                    },
                    automatic_leave: {
                        in_call_recording_timeout: b.max_duration_minutes * 60,
                        waiting_room_timeout: b.waiting_room_timeout_minutes *
                            60,
                    },
                },
            });
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const id = utils.json.optionalStr(res.body, "$.id");
            if (id === undefined || id === "") {
                throw Object.assign(
                    new Error("Recall bot create returned no id"),
                    { retriable: false },
                );
            }
            return { kind: "RUNNING", state: { externalRunId: id } };
        },
        /** POLL: a non-2xx on our read throws (retriable; the bot keeps
         *  running and billing). `fatal` settles as a synthesized 500
         *  (Recall does not bill it). `done` completes once the recording's
         *  transcript and media artifacts leave `processing`, with a bounded
         *  grace (30 ticks) so a stuck artifact cannot hang the run. */
        poll: async ({ data, utils, logger }) => {
            const $ = utils.json;
            const id = data.lifecycle.state.externalRunId;
            if (id === undefined) {
                throw Object.assign(
                    new Error("recall poll without externalRunId in state"),
                    { retriable: false },
                );
            }
            const res = await utils.http({
                method: "GET",
                path: "/api/v1/bot/" + encodeURIComponent(id) + "/",
            });
            if (res.status < 200 || res.status >= 300) {
                throw new Error("Recall bot read returned " + res.status);
            }
            const changes = $.optionalGet(res.body, "$.status_changes");
            const codes = (Array.isArray(changes) ? changes : []).map((e) =>
                e !== null && typeof e === "object" && !Array.isArray(e)
                    ? String(e.code ?? "")
                    : ""
            );
            if (codes.includes("fatal")) {
                logger.warn("recall bot ended fatal", { botId: id });
                return {
                    kind: "COMPLETED",
                    httpStatus: 500,
                    providerHttpStatus: res.status,
                    output: res.body,
                };
            }
            const stage = codes[codes.length - 1];
            if (!codes.includes("done")) {
                return {
                    kind: "RUNNING",
                    state: {
                        externalRunId: id,
                        ...(stage !== undefined ? { stage } : {}),
                    },
                };
            }
            const pending = [
                "transcript",
                "video_mixed",
                "audio_mixed",
            ].some((artifact) =>
                $.optionalGet(
                    res.body,
                    "$.recordings[0].media_shortcuts." + artifact +
                        ".status.code",
                ) === "processing"
            );
            const left = $.optionalNum(
                data.lifecycle.state.data ?? {},
                "$.graceLeft",
            ) ?? 30;
            if (pending && left > 0) {
                return {
                    kind: "RUNNING",
                    state: {
                        externalRunId: id,
                        stage: "processing",
                        data: { graceLeft: left - 1 },
                    },
                };
            }
            if (pending) {
                logger.warn("recall artifacts still processing after grace", {
                    botId: id,
                });
            }
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                providerHttpStatus: res.status,
                output: res.body,
            };
        },
        /** STOP: a bot that has not started joining is deleted (nothing
         *  billed); one in the call is told to leave, then read until
         *  `done` (bounded) so the bot time settles. */
        stop: async ({ data, utils }) => {
            const $ = utils.json;
            const id = data.lifecycle.state.externalRunId;
            if (id === undefined) {
                return { kind: "UNRESOLVED", reason: "no bot id in state" };
            }
            const path = "/api/v1/bot/" + encodeURIComponent(id) + "/";
            const read = await utils.http({ method: "GET", path });
            const changes = $.optionalGet(read.body, "$.status_changes");
            const started = Array.isArray(changes) && changes.length > 0;
            if (!started) {
                const del = await utils.http({ method: "DELETE", path });
                if (del.status >= 200 && del.status < 300) {
                    return {
                        kind: "COMPLETED",
                        httpStatus: 200,
                        output: read.body,
                    };
                }
            }
            const leave = await utils.http({
                method: "POST",
                path: path + "leave_call/",
                body: {},
            });
            if (leave.status >= 500) {
                return {
                    kind: "UNRESOLVED",
                    reason: "leave_call failed with HTTP " + leave.status,
                };
            }
            for (let attempt = 0; attempt < 10; attempt++) {
                await utils.sleep(10_000);
                const res = await utils.http({ method: "GET", path });
                if (res.status < 200 || res.status >= 300) continue;
                const now = $.optionalGet(res.body, "$.status_changes");
                const done = Array.isArray(now) &&
                    now.some((e) =>
                        e !== null && typeof e === "object" &&
                        !Array.isArray(e) && e.code === "done"
                    );
                if (done) {
                    return {
                        kind: "COMPLETED",
                        httpStatus: 200,
                        output: res.body,
                    };
                }
            }
            return {
                kind: "UNRESOLVED",
                reason: "bot left the call but did not reach done in budget",
            };
        },
    },
});
