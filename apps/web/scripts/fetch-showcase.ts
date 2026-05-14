import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "yaml";

const RAW_BASE =
  "https://raw.githubusercontent.com/mangowm/mango-showcase/main";

/**
 * Converts:
 * https://github.com/user/repo
 * ->
 * https://raw.githubusercontent.com/user/repo/main
 */
function toRawBase(dotfilesUrl: string): string {
  const url = new URL(dotfilesUrl);
  return `https://raw.githubusercontent.com${url.pathname}/main`;
}

/** Shape of each entry in entries.yml after bot stamping */
type RawEntry = {
  /** username is the only non-reserved key; value is the dotfiles URL */
  [username: string]: string;
  /** ISO timestamp stamped by the bot on merge */
  added?: string;
};

/** Shape written to showcase.json */
type ShowcaseEntry = {
  username: string;
  screenshot: string;
  dotfiles: string;
  added: string | null;
};

async function main() {
  console.log("Fetching showcase entries and downloading images...");

  const res = await fetch(`${RAW_BASE}/entries.yml`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const yamlText = await res.text();
  const rawEntries: RawEntry[] = parse(yamlText) || [];

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const imagesDir = path.resolve(__dirname, "../public/showcase");
  await fs.mkdir(imagesDir, { recursive: true });

  const entries: ShowcaseEntry[] = [];

  for (const item of rawEntries) {
    // The username key is whichever key is not "added"
    const usernameKey = Object.keys(item).find((k) => k !== "added");
    if (!usernameKey) {
      console.warn("  ⚠ Skipping malformed entry (no username key):", item);
      continue;
    }

    const username = usernameKey;
    const dotfiles = item[usernameKey];
    const added = item.added ?? null;

    const rawBase = toRawBase(dotfiles);
    const screenshotUrl = `${rawBase}/screenshot.png`;

    console.log(
      `Downloading screenshot for @${username} from ${screenshotUrl}...`,
    );

    const imgRes = await fetch(screenshotUrl);
    if (!imgRes.ok) {
      console.warn(
        `  ⚠ Skipping @${username}: screenshot.png not found (${imgRes.status})`,
      );
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${username}.png`;

    await fs.writeFile(path.join(imagesDir, fileName), buffer);

    entries.push({
      username,
      screenshot: `/showcase/${fileName}`,
      dotfiles,
      added,
    });
  }

  // Sort newest-first; entries without a timestamp go to the end
  entries.sort((a, b) => {
    if (!a.added && !b.added) return 0;
    if (!a.added) return 1;
    if (!b.added) return -1;
    return b.added.localeCompare(a.added);
  });

  await fs.writeFile(
    path.resolve(__dirname, "../src/showcase.json"),
    JSON.stringify(entries, null, 2),
  );

  console.log(
    `\nSuccessfully generated showcase.json with ${entries.length} entries.`,
  );
}

main();
