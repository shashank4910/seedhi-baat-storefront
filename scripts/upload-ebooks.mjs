import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sourceRoot = fileURLToPath(new URL("../../../outputs/Ebooks_PDF", import.meta.url));
const namespaceId = process.env.KV_NAMESPACE_ID || "409592ed244f4c96affc8235d9a65863";
const dryRun = process.argv.includes("--dry-run");
const wranglerCli = fileURLToPath(new URL("../node_modules/wrangler/wrangler-dist/cli.js", import.meta.url));
const files = [];

for (const language of ["Hinglish", "Hindi"]) {
  const directory = path.join(sourceRoot, language);
  if (!existsSync(directory)) throw new Error(`Missing ebook directory: ${directory}`);
  const pdfs = readdirSync(directory).filter((name) => /^0[1-5]_.+\.pdf$/i.test(name)).sort();
  if (pdfs.length !== 5) throw new Error(`Expected 5 PDFs in ${directory}; found ${pdfs.length}.`);
  for (const name of pdfs) {
    files.push({
      source: path.join(directory, name),
      key: `${language.toLowerCase()}/${name}`,
    });
  }
}

function runWrangler(args) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], {
    stdio: "inherit",
    shell: false,
    env: { ...process.env, CI: "true" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`${dryRun ? "Checking" : "Uploading"} ${files.length} protected ebooks to private KV:`);
for (const file of files) {
  const sizeMb = (statSync(file.source).size / 1024 / 1024).toFixed(2);
  console.log(`- ${file.key} (${sizeMb} MB)`);
  if (dryRun) continue;

  runWrangler([
    "kv",
    "key",
    "put",
    file.key,
    "--namespace-id",
    namespaceId,
    "--path",
    file.source,
    "--remote",
  ]);
}

if (!dryRun) {
  runWrangler([
    "kv",
    "key",
    "put",
    "__catalog_ready__",
    String(files.length),
    "--namespace-id",
    namespaceId,
    "--remote",
  ]);
}

console.log(
  dryRun
    ? "All source PDFs are present and mapped."
    : "All ebooks uploaded to private KV and the catalog-ready marker was written.",
);
