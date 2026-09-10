import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sourceRoot = fileURLToPath(new URL("../../../outputs/Ebooks_PDF", import.meta.url));
const bucket = process.env.R2_BUCKET || "seedhi-baat-ebooks";
const dryRun = process.argv.includes("--dry-run");
const runner = process.platform === "win32" ? "npx.cmd" : "npx";
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

console.log(`${dryRun ? "Checking" : "Uploading"} ${files.length} protected ebooks to ${bucket}:`);
for (const file of files) {
  const sizeMb = (statSync(file.source).size / 1024 / 1024).toFixed(2);
  console.log(`- ${file.key} (${sizeMb} MB)`);
  if (dryRun) continue;

  const result = spawnSync(
    runner,
    ["wrangler", "r2", "object", "put", `${bucket}/${file.key}`, "--file", file.source, "--remote"],
    { stdio: "inherit", shell: false },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(dryRun ? "All source PDFs are present and mapped." : "All ebooks uploaded to the private R2 bucket.");
