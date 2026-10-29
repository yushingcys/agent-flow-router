import { z } from "zod";
import { defineResource, resourceUsage } from "@shared/core";

/**
 * heygen/voice - an instant voice clone owned by this workspace. The
 * externalId is HeyGen's `voice_id`. Free to create and to keep (HeyGen's
 * instant-clone preview pricing), so the rate card is the free schedule.
 * /voices/delete deletes it upstream in the run; `release` below is the
 * host's idempotent confirmation (HeyGen answers a repeated delete with
 * the same success, and 404 counts as done).
 */
export default defineResource({
    slug: "voice",
    meta: {
        displayName: "Cloned voice",
        summary: "An instant clone of a voice from one recording.",
        description: "A private HeyGen Voice cloned from one recording, " +
            "usable with /text-to-speech and /speech-to-speech by this " +
            "workspace only. Free to create and keep; delete it any time.",
        docsUrl: "https://developers.heygen.com/docs/voices/" +
            "heygen-voice-instant-clone",
    },
    data: z.strictObject({ name: z.string() }),
    usage: resourceUsage.free(),
    lifecycle: {
        /** 404 means gone; any other non-2xx throws so the check retries. */
        verify: async ({ data, utils }) => {
            const res = await utils.http({
                method: "GET",
                path: "/v3/models/audio/voices/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) {
                return { active: false, inactiveReason: "http_404" };
            }
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "heygen voice verify failed with HTTP " + res.status,
                );
            }
            return { active: true };
        },
        release: async ({ data, utils }) => {
            const res = await utils.http({
                method: "DELETE",
                path: "/v3/models/audio/voices/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (
                !(res.status >= 200 && res.status < 300) &&
                res.status !== 404
            ) {
                throw new Error(
                    "heygen voice release failed with HTTP " + res.status,
                );
            }
            return { released: true };
        },
    },
});
