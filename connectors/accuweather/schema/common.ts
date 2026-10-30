import { z } from "zod";

/** Query parameters shared by AccuWeather Core Weather operations
 *  (developer.accuweather.com/core-weather, read 2026-10-29). Mirror
 *  carries optionality only (D25). */
export const zLanguage = z.string().describe(
    "Response language code, e.g. en-us (vendor default), fr-fr, de-de.",
);

export const zDetails = z.boolean().describe(
    "Include extended information (vendor default false).",
);
