import type { Json, RunInput } from "@shared/core";

function parseJson(flag: string, raw: string): Json {
    try {
        return JSON.parse(raw) as Json;
    } catch (error) {
        throw new Error(`${flag} is not valid JSON: ${error}`);
    }
}

export function runInputFromFlags(options: {
    body?: string;
    queryParams?: string;
    pathParams?: string;
}): RunInput {
    return {
        ...(options.body !== undefined
            ? { body: parseJson("--body", options.body) }
            : {}),
        ...(options.queryParams !== undefined
            ? {
                queryParams: parseJson(
                    "--query-params",
                    options.queryParams,
                ) as RunInput["queryParams"],
            }
            : {}),
        ...(options.pathParams !== undefined
            ? {
                pathParams: parseJson(
                    "--path-params",
                    options.pathParams,
                ) as RunInput["pathParams"],
            }
            : {}),
    };
}
