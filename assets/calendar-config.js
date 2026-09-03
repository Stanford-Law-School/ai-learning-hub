// =============================================================================
// Which calendar the Curiosity Corner list reads, and with what key.
//
// The calendar id is not a secret — it is already in the iframe URL further down
// events.html and in every public share link — so it is committed here. The API
// key is not committed. It is written over this file at deploy time by
// scripts/build-calendar-config.mjs from the AWS Amplify environment variable
// GOOGLE_CALENDAR_API_KEY (see the "Curiosity Corner hours" section of
// README.md for the console settings that make shipping it to the browser safe).
//
// With apiKey empty — locally, on a preview branch with no variable set, or if
// the build step is ever removed — assets/curiosity-corner.js does nothing at
// all and the written summary of the standing hours in the markup is what
// readers see. That is the intended fallback, not a failure state, so this file
// is deliberately valid and harmless as committed.
// =============================================================================

window.HUB_CALENDAR = {
  // The Curiosity Corner calendar: all of the library's AI hours.
  calendarId:
    "c_3ce86d0800c7eb54574a4b9780c16841ede64be125b24e0946ccf2b7ea6978b1@group.calendar.google.com",

  // Injected at build time. Empty here on purpose.
  apiKey: "",

  // These hours happen in a room in California, or on a Zoom call scheduled
  // against it, so every time on the list is printed in this zone and labeled.
  timeZone: "America/Los_Angeles",
  timeZoneLabel: "PT",

  // How far ahead to ask for, how many weeks of it to lay out, and how long a
  // reader moving between hub pages may keep the same answer. Three weeks is
  // enough to plan around; more than that, at three standing sessions a week,
  // is a wall of near-identical rows at the top of the page, and the month grid
  // at the foot of it is the better tool for looking further out. Weeks with
  // nothing on them do not count against the three.
  horizonDays: 60,
  maxEvents: 40,
  maxWeeksShown: 3,
  cacheMinutes: 10,

  // Set to a string — "curiosity", say — to list only events whose title
  // contains it. Empty means list everything on the calendar, which is right
  // while this calendar holds all of our hours and each row prints its own
  // title.
  titleFilter: ""
};
