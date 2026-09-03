// =============================================================================
// Write the API key from the environment into assets/calendar-config.js.
//
//     node scripts/build-calendar-config.mjs
//
// Run by amplify.yml before the artifacts are collected. Reads:
//
//   GOOGLE_CALENDAR_API_KEY   required; a browser-key restricted to the Google
//                             Calendar API and to this site's referrers
//   CURIOSITY_CALENDAR_ID     optional; overrides the committed calendar id
//
// With no key in the environment the committed file is left exactly as it is,
// and the page falls back to its written summary of the standing hours. That is
// the correct outcome for a preview branch nobody has configured, so this exits
// 0 and says so rather than failing the build.
//
// The key ends up in a file the browser downloads. That is unavoidable for a
// static site reading a Google API directly, and it is acceptable for this one
// key: it is read-only, it is scoped to the Calendar API alone, it is limited to
// our referrers, and the only thing behind it is a calendar that is already
// public. It must never be reused for anything else.
// =============================================================================

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "assets", "calendar-config.js");

const key = (process.env.GOOGLE_CALENDAR_API_KEY || "").trim();
const calendarId = (process.env.CURIOSITY_CALENDAR_ID || "").trim();

if (!key) {
  console.log(
    "build-calendar-config: GOOGLE_CALENDAR_API_KEY is not set. " +
      "Leaving assets/calendar-config.js as committed — the Curiosity Corner " +
      "section will show its written standing hours instead of the live list."
  );
  process.exit(0);
}

// A key is an opaque token, not code. Refusing anything that is not one keeps a
// mistyped variable from being written into a file the browser executes.
if (!/^[A-Za-z0-9_\-]{20,100}$/.test(key)) {
  console.error(
    "build-calendar-config: GOOGLE_CALENDAR_API_KEY does not look like a Google " +
      "API key (expected 20–100 characters of letters, digits, '-' and '_'). " +
      "Refusing to write it. Check the variable in the Amplify console for " +
      "stray quotes or whitespace."
  );
  process.exit(1);
}

if (calendarId && !/^[A-Za-z0-9_.+@%-]+$/.test(calendarId)) {
  console.error("build-calendar-config: CURIOSITY_CALENDAR_ID contains unexpected characters. Refusing to write it.");
  process.exit(1);
}

let source = await readFile(TARGET, "utf8");

function replaceStringField(text, field, value) {
  // Matches only the quoted value of that field, and only once. Throwing on a
  // miss means a rename in calendar-config.js breaks the build loudly instead of
  // deploying a config the injection quietly skipped.
  const pattern = new RegExp(`(${field}:\\s*\\n?\\s*)"[^"]*"`);
  if (!pattern.test(text)) {
    throw new Error(
      `build-calendar-config: could not find the "${field}" field in assets/calendar-config.js.`
    );
  }
  return text.replace(pattern, `$1"${value}"`);
}

source = replaceStringField(source, "apiKey", key);
if (calendarId) source = replaceStringField(source, "calendarId", calendarId);

await writeFile(TARGET, source);
console.log(
  `build-calendar-config: wrote the API key into assets/calendar-config.js` +
    (calendarId ? " and overrode the calendar id." : ".")
);
