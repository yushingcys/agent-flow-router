import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTtsBinding } from "../../schema/tts.ts";

/**
 * POST /v1/tts/stream/with-timestamp - the vendor streams Server-Sent
 * Events, one audio chunk (base64) plus the latest alignment snapshot for
 * its text chunk per event. `start` reads the whole stream and assembles one
 * answer: the full audio and absolute word timings.
 *
 * Joining base64 chunks: Fish says to concatenate them, which is only valid
 * when no chunk but the last carries `=` padding. When one does, the chunks
 * are decoded and re-encoded as one (closed terms have no atob/btoa).
 *
 * An empty stream on a 200 is a failed synthesis: a SYNTHESIZED 502 so the
 * engine zero-bills it (the minimax envelope rule).
 *
 * Same price as fishaudio#text-to-speech (per UTF-8 byte of text).
 */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Speech with Word Timings",
        summary: "Convert text to speech plus the start and end time of " +
            "every word.",
        description: "Everything fishaudio#text-to-speech does, plus " +
            "timing: returns `audio_base64`, `content_type`, " +
            "`audio_duration` in seconds, and `segments` - each spoken " +
            "word or token with its absolute `start` and `end` in the " +
            "audio. Use it for subtitles, karaoke-style highlighting or " +
            "lip-sync. $15 per million UTF-8 bytes of text ($0.015 per " +
            "1K), $50 on drama-3.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/openapi-v1/" +
            "text-to-speech",
        categories: ["speech"],
    },
    endpoint: "/text-to-speech/timestamps",
    request: { method: "POST", path: "/v1/tts/stream/with-timestamp" },
    input: { schema: { body: zTtsBinding } },
    lifecycle: {
        start: async ({ data, utils }) => {
            const { model, ...body } = data.input.body;
            const res = await utils.request({
                headers: { model },
                body: JSON.parse(JSON.stringify(body)),
            });
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const text = typeof res.body === "string" ? res.body : "";
            const events = text.split("\n")
                .filter((line) => line.startsWith("data:"))
                .map((line) => JSON.parse(line.slice(5).trim()));
            const chunks = events
                .map((e) => e.audio_base64)
                .filter((c) => typeof c === "string" && c !== "");
            if (chunks.length === 0) {
                return {
                    kind: "COMPLETED",
                    httpStatus: 502,
                    providerHttpStatus: res.status,
                    output: "Fish Audio stream carried no audio",
                };
            }
            let audio = chunks.join("");
            if (chunks.slice(0, -1).some((c) => c.endsWith("="))) {
                const alpha =
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                const bytes = [0].slice(1);
                for (const chunk of chunks) {
                    let buf = 0;
                    let bits = 0;
                    for (const ch of chunk) {
                        if (ch === "=") break;
                        buf = ((buf << 6) | alpha.indexOf(ch)) & 0xffffff;
                        bits += 6;
                        if (bits >= 8) {
                            bits -= 8;
                            bytes.push((buf >> bits) & 255);
                        }
                    }
                }
                audio = "";
                for (let i = 0; i < bytes.length; i += 3) {
                    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) |
                        (bytes[i + 2] ?? 0);
                    audio += alpha[(n >> 18) & 63] + alpha[(n >> 12) & 63] +
                        (i + 1 < bytes.length ? alpha[(n >> 6) & 63] : "=") +
                        (i + 2 < bytes.length ? alpha[n & 63] : "=");
                }
            }
            // the LATEST snapshot per text chunk wins; offsets make it absolute
            const latest = events.slice(0, 0);
            for (const e of events) {
                if (e.alignment) latest[e.chunk_seq] = e;
            }
            const ordered = latest.filter((e) => e);
            const segments = events.slice(0, 0);
            for (const e of ordered) {
                for (const s of e.alignment.segments) {
                    segments.push({
                        text: s.text,
                        start: s.start + e.chunk_audio_offset_sec,
                        end: s.end + e.chunk_audio_offset_sec,
                    });
                }
            }
            const last = ordered[ordered.length - 1];
            const format = data.input.body.format ?? "mp3";
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: {
                    audio_base64: audio,
                    content_type: format === "mp3"
                        ? "audio/mpeg"
                        : format === "wav"
                        ? "audio/wav"
                        : format === "opus"
                        ? "audio/ogg"
                        : "audio/pcm",
                    audio_duration: last
                        ? last.chunk_audio_offset_sec +
                            last.alignment.audio_duration
                        : null,
                    segments,
                },
            };
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                text_byte: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.000015 },
                    label: "text bytes",
                    description: "$15 per million UTF-8 bytes of text " +
                        "(s2.1-pro, s2-pro, s1)",
                },
                drama_text_byte: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.00005 },
                    label: "drama-3 text bytes",
                    description: "$50 per million UTF-8 bytes of text on " +
                        "drama-3",
                },
            },
        },
        estimate: ({ data }) => {
            let bytes = 0;
            for (const ch of data.input.body.text) {
                const cp = ch.codePointAt(0) ?? 0;
                bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
            }
            return {
                counts: data.input.body.model === "drama-3"
                    ? { drama_text_byte: bytes }
                    : { text_byte: bytes },
            };
        },
        evidence: ({ data }) => {
            let bytes = 0;
            for (const ch of data.input.body.text) {
                const cp = ch.codePointAt(0) ?? 0;
                bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
            }
            return {
                counts: data.input.body.model === "drama-3"
                    ? { drama_text_byte: bytes }
                    : { text_byte: bytes },
            };
        },
    },
});
