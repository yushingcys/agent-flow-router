/** Guard the public source boundary before publishing or accepting changes. */
const allowedRoots = new Set([
    "engine",
    "connectors",
    "shared",
    "scripts",
    "mcp",
    ".github",
]);
const allowedFiles = new Set([
    "README.md",
    "DEVELOPMENT.md",
    "AGENT.md",
    "LICENSE",
    "THIRD_PARTY_NOTICES",
    "SECURITY.md",
    "deno.json",
    "deno.lock",
    "config.yml",
    ".gitignore",
]);
const out = await new Deno.Command("git", {
    args: ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    stdout: "piped",
}).output();
if (!out.success) throw new Error("cannot inspect public repository files");
const files = new TextDecoder().decode(out.stdout).split("\0").filter(Boolean);
const failures: string[] = [];
for (const file of files) {
    if (!allowedFiles.has(file) && !allowedRoots.has(file.split("/")[0])) {
        failures.push(file);
    }
    if (file === "scripts/monid-prices.ts") failures.push(file);
    if ((await Deno.lstat(file)).isSymlink) failures.push(`${file}: symlink`);
    if (!file.endsWith(".ts")) continue;
    const source = await Deno.readTextFile(file);
    if (
        /(?:from|import)\s*[('"].*(?:agentflow\/|monid-prices\.json|\/access\.ts|\/wallet\.ts|\/accounts\.ts)/
            .test(source)
    ) {
        failures.push(`${file}: private product import`);
    }
}
if (failures.length) {
    throw new Error(`public boundary violations:\n${failures.join("\n")}`);
}
console.log(`Public source boundary checked: ${files.length} files.`);
