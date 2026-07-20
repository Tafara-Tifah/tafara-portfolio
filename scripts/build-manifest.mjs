// Regenerates vault/manifest.json by scanning the vault for Markdown notes.
// Run with: node scripts/build-manifest.mjs
// (Also runs automatically on GitHub via .github/workflows/deploy.yml,
//  so you normally never need to run it by hand.)
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const vault = join(root, "vault");

const mdIn = (dir) =>
  readdirSync(join(vault, dir))
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => `vault/${dir}/${f}`);

const manifest = {
  profile: "vault/profile.md",
  skills: "vault/skills.md",
  achievements: "vault/achievements.md",
  education: "vault/education.md",
  references: "vault/references.md",
  career: mdIn("career"),
  projects: mdIn("projects"),
};

writeFileSync(join(vault, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("vault/manifest.json updated:");
console.log(JSON.stringify(manifest, null, 2));
