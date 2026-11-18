import {
    assert,
    assertEquals,
    assertNotEquals,
    assertRejects,
} from "@std/assert";
import { walk } from "@std/fs";
import { join } from "@std/path";
import { sha256Hex } from "@shared/core";
import { compilerVersion, engineVersion, inputsKey, REPO_ROOT } from "./lib.ts";

async function serialInputsKey(versions: string[]): Promise<string> {
    const parts = [`versions:${versions.join(",")}`];
    const files = [join(REPO_ROOT, "config.yml")];
    for (const root of ["connectors", "shared/core", "shared/compiler"]) {
        for await (
            const entry of walk(join(REPO_ROOT, root), {
                includeDirs: false,
                exts: [".ts", ".json"],
            })
        ) {
            files.push(entry.path);
        }
    }
    files.sort();
    for (const file of files) {
        parts.push(`${file}:${await sha256Hex(await Deno.readTextFile(file))}`);
    }
    return await sha256Hex(parts.join("\n"));
}

Deno.test("inputsKey: bounded parallel hashing matches the serial catalog digest", async () => {
    const versions = await Promise.all([engineVersion(), compilerVersion()]);
    const expected = await serialInputsKey(versions);
    const readTextFile = Deno.readTextFile;
    let active = 0;
    let peak = 0;
    Deno.readTextFile = async (...args) => {
        peak = Math.max(peak, ++active);
        try {
            return await readTextFile(...args);
        } finally {
            active--;
        }
    };
    try {
        assertEquals(await inputsKey(versions), expected);
        assert(peak > 1 && peak <= 16, `concurrent reads: ${peak}`);
    } finally {
        Deno.readTextFile = readTextFile;
    }
});

Deno.test("inputsKey: changing one input's content changes the key", async () => {
    const versions = await Promise.all([engineVersion(), compilerVersion()]);
    const before = await inputsKey(versions);
    const readTextFile = Deno.readTextFile;
    Deno.readTextFile = async (...args) => {
        const content = await readTextFile(...args);
        return args[0] === join(REPO_ROOT, "config.yml")
            ? `${content}\n`
            : content;
    };
    try {
        const after = await inputsKey(versions);
        assertNotEquals(after, before);
        assertEquals(after, await serialInputsKey(versions));
    } finally {
        Deno.readTextFile = readTextFile;
    }
});

Deno.test("inputsKey: read errors propagate", async () => {
    const readTextFile = Deno.readTextFile;
    Deno.readTextFile = () =>
        Promise.reject(new Deno.errors.PermissionDenied("denied"));
    try {
        await assertRejects(
            () => inputsKey([]),
            Deno.errors.PermissionDenied,
            "denied",
        );
    } finally {
        Deno.readTextFile = readTextFile;
    }
});
