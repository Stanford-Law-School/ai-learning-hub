# The AI Learning Hub

The Robert Crown Law Library's AI Learning Hub for Stanford Law School, plus the
student-facing AI Skills it distributes.

The hub is **open to the whole SLS community** — students, staff, and faculty — and
requires no sign-in. That is the difference between this site and
[`sls-faculty-ai-skills`](https://github.com/whuggins-RCLL/sls-faculty-ai-skills),
which is written for faculty and sits behind Stanford authentication. The two sites
share one design system so they read as one family.

They are otherwise entirely separate: separate repositories, separate deployments,
separate dependencies, and separate authentication. Nothing of the faculty site is
copied here, and this site holds no credential of any kind. The only thing joining
them is a pair of ordinary links — `faculty.html` here points at the faculty site,
and the faculty site's header points back.

The same holds for
[`The-AI-Upload`](https://github.com/whuggins-RCLL/the-ai-upload), the Library's
weekly AI news digest: its own repository and deployment, `ai-upload.html` here
points at it, and its header points back. Both sibling sites were embedded in this
one until SLS IT prohibited embedding the faculty site; both are now reached by an
ordinary link, and nothing here frames either.

This site is read inside Google Sites — one full-page frame per hub page. See
[Inside Google Sites](#inside-google-sites) for how the two stay in step. That
sentence used to begin "Like the faculty site"; the faculty site is no longer
framed anywhere, and this site's own framing is unrelated to it.

## The site

Plain static HTML — no build step, no framework, no server. Open `index.html` or
serve the directory and it works:

```
python3 -m http.server 8000
```

| File | What it is |
| --- | --- |
| `index.html` | The hub landing page |
| `pause-rule.html` | The PAUSE Rule — the AI use workflow |
| `tutorials.html` | The tutorial library: eight topics, ~34 guides and DIY modules |
| `ai-resources.html` | AI tools available to the SLS community, and the policy that governs them |
| `ai-in-the-library.html` | The library's AI display: 7 parts, 24 panels, 32 books |
| `reading-list.html` | The 32-book shelf on its own page (same data as the display) |
| `assets/books.js` | Shared reading-list data and card renderer |
| `assets/ai-reading-list.pdf` | The same shelf as a printable PDF, with clickable SearchWorks links |
| `scripts/generate-reading-list-pdf.py` | Builds that PDF from `assets/books.js` |
| `events.html` | What the Curiosity Corner is, the upcoming hours, trainings, and the calendar |
| `assets/curiosity-corner.js` | Draws the upcoming Curiosity Corner hours from the calendar |
| `assets/calendar-config.js` | Which calendar it reads; the API key is injected at deploy time |
| `scripts/build-calendar-config.mjs` | Writes that key in from the Amplify environment |
| `past-events.html` | Archive of past sessions and Tech Club meetings |
| `skills.html` | The twenty-one downloadable AI skills, the three one-click sets, and the practice drafts |
| `skills/bundles.json` | Which skills each set holds, and in what order |
| `scripts/build-skill-bundles.py` | Builds `assets/bundles/*.zip` from that manifest |
| `assets/skill-bundles.js` | The download-them-separately button on the set cards |
| `assets/writing-samples/` | Five fictional student drafts to practise the writing skills on |
| `install.html` | What a skill file is, and how to install one in ChatGPT or Claude |
| `case-study-anthropic-legal-skills.html` | Case study: reverse-engineering Anthropic's AI governance legal skills |
| `writing-partner-agent.html` | Loading the ten writing skills into one ChatGPT agent |
| `teach-this-writing-partner.html` | Workshop packet: set-up, activities, discussion, notes, glossary |
| `assets/writing-partner-agent-instructions.md` | The text a student pastes into that agent (source of truth) |
| `scripts/inject-agent-instructions.py` | Copies that file into the page's copy box |
| `assets/copy-code.js` | The copy button on the case study's skill template |
| `assets/install-a-skill-guide.pdf` | Printable skill-installation guide with clickable links to both videos |
| `faculty.html` | Faculty support landing page &mdash; describes the faculty AI site and links to it |
| `faculty-publications.html` | SLS faculty publications on AI, embedded within the hub navigation |
| `ai-upload.html` | The AI Upload landing page &mdash; describes the weekly digest and links to it |
| `assets/styles.css` | The design system |
| `your-ai-stack.html` | Your AI Stack — the searchable directory of 113 AI tools |
| `assets/ai-stack-data.js` | The tool catalogue and the retired-product list (generated) |
| `assets/ai-stack.js` | Browsing, filtering, comparing, and saving for Your AI Stack |
| `assets/hub.js` | The theme toggle and the collapsing navigation |
| `search.html` | Site search, answered in the browser |
| `assets/search.js` | The matching and drawing behind it |
| `assets/search-index.js` | The index it searches (generated) |
| `scripts/build-search-index.mjs` | Builds that index from the rendered pages |
| `assets/embed-map.js` | Generated: which Google Sites page holds each hub page |
| `assets/embed.js` | Sends hub links to those Google Sites pages when the hub is framed |
| `scripts/build-embed-map.py` | Builds that map and wires the pages to it |
| `embed-codes.html` | Maintenance page: the frame to paste into each Google Sites page |
| `vercel.json` | Who is allowed to frame the site |

All of it is ported from the previous AI Learning Hub, which was a set of
standalone Tailwind and React pages, into the one design system below.

### Navigation

The header's primary row holds six destinations and no more. A utility row above
it places a Home button and a site-scoped search at the top right. The six primary
destinations are The AI Upload, Tutorials, Resources, Events, Skills, and Faculty
Support.

The footer is reserved for outbound Stanford links and does not repeat the site
navigation. Secondary pages are linked from relevant landing-page content.

The PAUSE Rule is not in the bar. It is a short link on the home hero rather than
a primary call to action or a destination card that restates the nav.

The bar and footer are the same markup on every page that has them, which no one
should be retyping eleven times. They are written by `scripts/nav.py`: it replaces
the `.siteHeader` and `.footer` block in each file in place and is idempotent. The
committed pages stay plain HTML with no build step, so an ordinary edit is still an
ordinary edit; re-run the script after changing a nav entry.

```
python3 scripts/nav.py
```

### Search

The header search used to hand the query to Google with a `site:` filter. That only
ever worked if Google had crawled the deployment, and it had not — so the box
returned "did not match any documents" for words plainly on the page, which is
worse than no search at all. It now goes to `search.html`, which answers from an
index of this site and nothing else.

The index is generated from the **rendered** pages rather than from the HTML,
because three of them build their content from arrays at the bottom of the file
(`tutorials.html`, `ai-in-the-library.html`, `your-ai-stack.html`); reading the DOM
after render indexes what a reader actually sees, and keeps working if a page
changes how it is built. Entries are per card where a page is built from cards and
per id'd section otherwise, so a result links to the place it was found rather than
the top of a long page.

```
node scripts/build-search-index.mjs            # write assets/search-index.js
node scripts/build-search-index.mjs --check    # non-zero if it is out of date
```

Re-run it after editing page content and commit the result. It is the one script
here that needs Playwright, so it is a maintainer step rather than a build step —
`PLAYWRIGHT_PATH=/path/to/playwright/index.js` points it at a global install if you
do not want a local dependency. The index is currently 473 entries and about 286 kB,
loaded on `search.html` alone and nowhere else.

Matching is prefix-per-word ("cita" finds "citation", "ation" does not), all terms
must appear, and a heading hit outweighs a passing mention. Snippets are built as
text nodes and `<mark>` elements rather than markup, so a query can never become
HTML.

### The Curiosity Corner hours

`events.html` leads with what the AI Curiosity Corner actually is — drop-in, one to
one, no appointment — and then lists the next few days of hours as a chronological
list built out of the site's own elements. `assets/curiosity-corner.js` reads the
Curiosity Corner calendar over the public Google Calendar API and draws a real `<ol>`
of days, each with its sessions: the time as `<time>` elements, an "In person" / "On
Zoom" / "In person and on Zoom" badge, a "Happening now" label on a session in
progress, a one-click "Add to my calendar" link, and a Zoom link when the event
carries one. Below the list, two subscribe links put every future session on the
reader's own calendar.

The **SLS Tech Club** section — the club charter, the mission statement, the
governance notes, and the Slack link — is off this page. Events is now about what the
library runs and when you can turn up to it, and a monthly club's charter is not that.
The Tech Club's meeting archive is unchanged on `past-events.html`, whose intro
paragraph now points at the `#techclub` Slack channel for the charter rather than at
the anchor on this page that no longer exists.

The Google Calendar iframe further down the page stays as the month grid, for looking
further ahead than the list. It is not how the hours are marketed any more: a framed
month grid is a second stylesheet that cannot be told which theme it is in, ignores
our type, and buries the next available session three clicks deep. Everything above it
is ours, so light mode, dark mode, keyboard focus, and the print stylesheet all work
the way they do everywhere else on the site.

**It degrades to prose, not to a spinner.** The container in the markup holds a
written summary of the standing hours. The script replaces that only once it has real
events in hand, so with JavaScript blocked, the API unreachable, no key configured, or
nothing on the calendar for the next sixty days, a reader still gets an answer to
"when can I come in". Times are always printed in `America/Los_Angeles` and labeled
`PT`, because these are hours in a room in California; a visitor's local time would be
a kindness that mostly produces confusion.

Nothing from the API is ever treated as markup. Every value goes into the page through
`createElement` and `textContent`, and a URL out of an event's location or description
is linked only if it is `https` and on a short host allowlist (`zoom.us`,
`stanford.edu`, `law.stanford.edu`, `google.com`).

#### Configuring it

The calendar id is public — it is in the iframe URL on the same page — and is
committed in `assets/calendar-config.js`. The API key is not. It is written into that
file at deploy time by `scripts/build-calendar-config.mjs`, which `amplify.yml` runs
in its build phase:

```
node scripts/build-calendar-config.mjs   # reads GOOGLE_CALENDAR_API_KEY from the environment
```

With no variable set the script exits 0 and leaves the committed file alone, so a
branch preview nobody has configured still deploys and simply shows the written hours.

To set it up, in the **Google Cloud console**:

1. Enable the **Google Calendar API** on a project.
2. Create an **API key** under *APIs & Services → Credentials*.
3. Restrict it: *API restrictions* → **Google Calendar API** only; *Application
   restrictions* → **Websites**, listing the hub's own origins (the Amplify domain,
   any custom domain, and `http://localhost` if you preview locally).
4. Make sure the calendar itself is shared as **"Make available to public / See all
   event details"** — the key authorizes the caller, not the calendar.

Then in the **Amplify console**, under *Hosting → Environment variables*, add
`GOOGLE_CALENDAR_API_KEY` with that key and redeploy. `CURIOSITY_CALENDAR_ID` is an
optional second variable that overrides the committed calendar id without a commit.

This key does ship to the browser, which is unavoidable for a static site reading a
Google API directly. It is acceptable for this one key and no other: it is read-only,
scoped to the Calendar API alone, limited to our referrers, and the only thing behind
it is a calendar that is already public. It is the opposite trade from the Gemini
"AI Curator" key described below, which would have been a write-capable key on a paid
API — that one we did not take.

### Content that is data, not markup

Two pages keep their content in one array at the bottom of the file and render the
cards from it, because both are lists that grow and an entry beats a block of copied
HTML: `tutorials.html` (~34 tutorials) and `ai-in-the-library.html` (7 categories, 24
panels). The previous hub's tutorials page worked the same way. Everything else is
written out as HTML.

The thirty-two books are different: they live once in `assets/books.js` and are
rendered by both `reading-list.html` and the Selected Reading section of
`ai-in-the-library.html`. Edit the array in that file to update both pages.

### Your AI Stack

`your-ai-stack.html` was its own repository — `whuggins-RCLL/Your-AI-Stack`, a Vite +
React + Tailwind app. The hub link used to point at a Google Sites page wrapping it.
The directory now runs natively here: 113 tools, 29 retired products, the same
categories, and the guide sections, in the hub's design system with no build step.

The catalogue is generated rather than retyped. `scripts/port-ai-stack.mjs` reads
`src/data.ts` and `src/data/discontinuedAi.ts` out of the Your-AI-Stack checkout and
writes `assets/ai-stack-data.js`. Edit the entries there and re-run it; do not
hand-edit the generated file, or the two copies will drift.

```
node scripts/port-ai-stack.mjs
```

Everything else lives in `assets/ai-stack.js`, which is plain ES5-flavoured
JavaScript like `hub.js`. Two things differ from the app it replaces, and both are
navigation fixes rather than ports:

- **Every view is in the URL.** A search, a category, the saved list, an open tool,
  and a comparison are all encoded in `location.hash` — `#tool=notebooklm`,
  `#cat=Legal+Research+%26+Analysis`, `#cmp=claude,gemini&open=compare`. Any of them
  can be linked to or bookmarked, and Back closes an overlay rather than leaving the
  site. In the app all of this was component state.
- **Saves persist.** The saved list is in `localStorage`, so following a link out to a
  vendor and coming back does not empty it. The app kept saves in memory only.

Three of the app's features did **not** come across:

- **The blocking disclaimer modal.** The same text is now a note at the top of the
  page. A modal that has to be dismissed on every visit before anything can be read
  is a toll, not a disclosure, and it was the first thing every reader saw.
- **The html2pdf export**, which pulled in a 985 kB dependency. The saved list prints
  through a print stylesheet — every browser's print dialog saves to PDF — and there
  is a dependency-free Markdown download beside it.
- **Tool logos**, which were `picsum.photos` placeholder images keyed by tool name,
  so they were decorative noise fetched from a third party on every card.

### AI in the Library

`ai-in-the-library.html` was its own repository —
`whuggins-RCLL/AI-at-the-Robert-Crown-Law-Library`, a Vite + React app deployed at
`ai-at-rcll.vercel.app`. All of its content is here now: 7 categories, 24 exhibit
panels, 32 books, the About notes, and the acknowledgments. Nothing in the hub links
to the old deployment any more, so that repository can be retired.

Two of the app's features did **not** come across, and both were deliberate:

- **The Gemini "AI Curator" chat.** It needed a Google GenAI key. Vite inlines
  `VITE_API_KEY` into the client bundle, so on a public static site that key is a
  published key. The hub has no build step and no secret handling, and adding both to
  carry one chat widget was not the trade we wanted.
- **The reading-list PDF export**, which needed jsPDF in the browser. The PDF is
  offered again on both pages, but it is built once at author time instead:
  `scripts/generate-reading-list-pdf.py` reads `assets/books.js` and writes
  `assets/ai-reading-list.pdf`, so no reader downloads a PDF library to get one, and
  the file cannot drift from the shelf. It uses no third-party packages — the same
  hand-written PDF writer as the installation guide — and its output is
  deterministic, so rebuilding without a change to the books produces no git diff.

  ```
  python3 scripts/generate-reading-list-pdf.py          # rewrite assets/ai-reading-list.pdf
  python3 scripts/generate-reading-list-pdf.py --check  # non-zero if a rebuild would change it
  ```

  Each of the thirty-two entries carries its title, author, publisher, date, ISBN, the
  annotation from the shelf, and a clickable link to its SearchWorks record; an entry is
  never split across a page break. Re-run the script after editing `assets/books.js`.

**The reproduced poster images are gone too.** Each exhibit panel used to carry a
photograph of the printed poster, hotlinked from `postimg.cc` — up to two per card,
about twenty images in all. They were a third-party dependency for content the cards
already state in text, they arrived as flat white rectangles that had to be dimmed to
sit on the dark theme, and small type in a screenshot is not readable text. The cards
are the content now, and the display they describe is on the library's first floor.
`itemCard()` lost its `poster`/`extraPoster` fields and the `.posterGrid`,
`.posterFigure`, `.exhibitPosters`, `.hasPosters` and `.multiPoster` rules went with
them, which also returned `.exhibitGrid` to a plain three-column grid — the full-row
card variant existed only to give a poster room to be read.

The app also fetched book covers at runtime from the Open Library and Google Books
APIs. Covers here come from Open Library by ISBN as a plain image URL
(`covers.openlibrary.org/b/isbn/<isbn>-M.jpg?default=false`) rather than an API call.
`default=false` makes a missing cover a 404 instead of a blank placeholder, and an
`onerror` handler then removes the element so the card reflows to text. Books whose
covers the display had scanned itself keep those.

### Styling

`assets/styles.css` began as the faculty site's `website/app/globals.css`, copied,
followed by one clearly marked section of hub-only additions (the PAUSE Rule's
gates and verdicts, the skill cards, the landing pages). The intent is that the
shared part stays an unmodified copy, so a change to the design system is a
re-copy plus a look at the additions rather than a merge.

**In practice the shared part has already diverged**, and this file said
"verbatim" for longer than that was true. The two sheets differ from about 6 kB in,
where the hub's two-row header needs `.headerNavigation`, `.headerTools` and
`.homeButton` and the faculty site's one-row header does not. So a re-copy is not
currently a safe operation: diff the two first, and treat anything the hub added to
the shared region as a deliberate exception to be carried across. Reconciling them
is worth doing and is not a small change.

The hub has no account link because there is nothing to sign in to.

### The two sibling sites, and how this one hands off to them

`faculty.html` is an ordinary hub page: header, footer, navigation, theme toggle,
and it is in the search index like any other. It describes the faculty AI site,
lists who may sign in, points students at `skills.html` instead, and carries one
link — **Access Faculty Resources** — to the faculty site's own address.

It is a link and not an embed, deliberately and permanently. The faculty site is a
separate application on its own domain with its own Firebase sign-in; SLS IT has
prohibited embedding it here. Do not reintroduce an iframe, an embedded webview,
or client-side injection of its markup to get the same effect.

Two things about that link are load-bearing:

- **`target="_blank"`.** Every hub page is itself a full-page frame on a Google
  Sites page, so a same-tab link would load the faculty site *inside that frame* —
  recreating the embedding by accident. A new top-level tab is also where Google
  sign-in is most reliable, because a pop-up inside a frame is the case browsers
  restrict. `_top` would keep it to one tab, but Google's embed sandbox can
  withhold top-level navigation, so `_blank` is the sturdier of the two.
- **It is a plain cross-origin `<a href>`.** `assets/embed.js` leaves cross-origin
  links alone, so the Google Sites link rewriting does not touch it.

`ai-upload.html` gets exactly the same treatment, and for the same reason. It was
the last full-page frame on the site, holding The AI Upload; it is now a landing
page that says what the digest is, what is in an issue, and links to it with the
same `target="_blank"`. The digest needs no sign-in, so that page carries no
eligibility rules and no student referral — it is the simpler of the two.

**Nothing on this site frames another site any more.** `body.hasEmbed` and
`.embedFrame` are deleted, `EMBED_PAGES` in `scripts/nav.py` is empty, and
`NO_RUNTIME` in `scripts/build-embed-map.py` is empty. `.digestEmbed`, which the
faculty site used for its own frame around the same digest, is deleted from both
stylesheets. The only frames left are the bounded inline panels — the event
calendar, the week-at-a-glance board, the faculty publications list — which show
one third-party thing inside a page that is otherwise ours.

The `EMBED_PAGES` and `frame_for()` machinery is kept even though both sets are
empty. It is generic and cheap, and it is what made removing these frames
self-correcting: because `frame_for()` reads the iframe `src` out of the page
rather than from a list, deleting an iframe drops the `frame` key from the map by
itself. What it must not become is a habit.

`faculty-publications.html` embeds the Stanford Law School faculty AI publications
list within a standard hub page, preserving the hub header, footer, and navigation
around the external content.

### Inside Google Sites

The hub is served from Vercel but read inside Google Sites: every hub page is a
full-page frame on a matching Google Sites page under
`https://ailearninghub.law.stanford.edu`. Nothing about the domain changes — the
Google Site stays the address, and Vercel stays where the site is built.

The problem that creates is navigation. A click on "Tutorials" inside a frame
swaps the document in the frame and leaves the address bar showing whichever
Google Sites page the reader started on. The address is then wrong, the back
button steps out of the site rather than back a page, and any URL a reader copies
sends someone else to the wrong place.

So `assets/embed.js` rewrites, when — and only when — the page is being read
inside a frame, every link to another hub page into the Google Sites page that
holds it, and points it at the top window. The whole tab moves, Google Sites
loads its own page, and that page's frame loads the page the reader asked for.
The address bar keeps up, the back button works, and every URL is shareable.

Read directly on Vercel the file does nothing: links stay ordinary relative
links, so the site is still testable on its own and still works if the Google
Sites side is ever taken down.

The map both halves read is generated, not kept by hand:

```
python3 scripts/build-embed-map.py            # write the map, wire the pages
python3 scripts/build-embed-map.py --check    # non-zero if either is stale
```

It derives `assets/embed-map.js` from the pages that exist — the Google Sites
path is the file name without `.html`, with any exception listed in `SLUGS` —
and makes sure every page loads the runtime. Adding a page to the hub is still
just adding an HTML file; re-run this afterwards.

`index.html` is one of those exceptions: it sits at `/home` rather than `/`,
because the Google Sites root is that site's own hand-built landing page and the
hub's landing page is a full page embed alongside it.

To see the rewriting without Google Sites, open any page with `?embed=1` on the
end. That is the same switch the frame check sets, so the links change in an
ordinary tab and can be hovered and read. Without it, on Vercel, links stay
Vercel links — that is the file doing its job, not failing to.

`embed-codes.html` is the maintenance page that turns the map into work. It
prints, for every published page, the Google Sites path that page must have and
the Vercel URL to give it, built from the same map the site uses, so the two
cannot drift. It renders whichever origin it is being served from, so a preview
deployment prints correct URLs too. It is not linked from the site and is kept
out of the search index.

The Google Sites pages are built as **full page embeds** — the Pages panel, *+*,
*New full page embed* — which take a URL and size themselves to the page. The
custom path under *Advanced* has to match the path the map records, or the hub's
own navigation will point at a page that does not exist. Each block also carries
the iframe for the other route, *Insert > Embed > Embed code*, for a Google Sites
page that has to hold something besides the hub; that one is a block on the page
and has to be dragged to full width and height by hand.

Three things are worth knowing before building the Google Sites pages.

**Top-level navigation has to be allowed.** Google wraps pasted embed code in a
sandbox, and a sandbox that withholds top-level navigation swallows these clicks:
the frame changes and the address bar does not. Test one page before building all
of them. If it happens, change `LINK_TARGET` in `scripts/build-embed-map.py` from
`"_top"` to `"_blank"` and re-run — links then open the right Google Sites page
in a new tab instead, which is worse but not broken.

**Search stays inside the frame.** Google Sites cannot pass a query string on its
own URL through to the frame it hosts, so a Google Sites `/search` page would
always come up empty. `search.html` is marked `inframe` in the map: it runs inside
whichever frame the reader is already in, and its results link out to the right
Google Sites page like any other hub link. A cross-page `#fragment` is dropped for
the same reason — a kept fragment would promise a section Google Sites cannot
scroll the frame to, so the reader lands at the top of the right page instead and
the shared URL stays honest. `KEEP_HASH` turns that off if the Google Sites pages
ever grow matching anchors.

**No page is framed directly any more, and two Google Sites pages need repointing
by hand.** A page that was nothing but a frame around another site used to be
recorded in the map with a `frame` key, so Google Sites could frame that site
directly rather than nesting three deep. `faculty.html` and `ai-upload.html` were
the two. Because `frame_for()` reads the `src` out of the page rather than from a
list, deleting each iframe dropped its `frame` key on its own, and the map now
tells Google Sites to frame the hub page instead.

**The Google Sites side does not update itself.** Until somebody edits them, the
pages at `/faculty-support` and `/ai-upload` keep framing whatever URL they were
last given — which is the other site, directly. Open `embed-codes.html`, copy the
URL it now prints for each, and replace the full-page embed on that Google Sites
page. The caption above each block says which it is showing, so a block still
reading *shows `https://…` directly* has not been repointed yet.

`vercel.json` carries one header: a `frame-ancestors` policy that permits Google
Sites and the hub domain to frame the site and no one else. It is the one change
here that can fail loudly — if Google ever serves embed code from an origin the
list does not cover, the frame goes blank. Deleting `vercel.json` restores the
previous behaviour, which was to let anyone frame the site.

## The skills

Each skill is a validated `skill.zip` under `skills/`, containing its `SKILL.md`,
ChatGPT interface metadata, and supporting Stanford Law School references. Download
one and upload it to ChatGPT or Claude; you never unzip it.

### Core pathway

1. SLS AI Orientation
2. SLS AI Task-Fit Coach
3. SLS Case Learning Coach
4. SLS Legal Research Learning Coach
5. SLS AI Verification Lab

### Optional tool studios

- SLS Harvey Learning Studio
- SLS Legora Learning Studio
- SLS LexText Learning Studio
- SLS CICERO Oral Argument Studio
- SLS Gemini Notebook Learning Studio (formerly NotebookLM)
- SLS AI Tool Explorer

### Writing partner

Ten review skills for a draft that is already written. Each acts as a reviewer, not a
ghostwriter: it flags, explains, and locates, and hands the revision back to the
student.

1. SLS AI Use Gate — run first; is this AI use authorised here at all
2. SLS Writing Review — the full workflow, and a Word review copy
3. SLS Argument and Structure
4. SLS Flow and Organisation
5. SLS Clarity and Precision
6. SLS Audience and Reception
7. SLS Counterargument Stress Test
8. SLS Claims and Source Traceability
9. SLS Bluebook Audit
10. SLS Genre Fit

### Practice drafts

`assets/writing-samples/` holds five fictional student drafts — a case brief, three
memos of increasing length and citation density, and a timed exam answer — offered
on `skills.html` under **Practice drafts**. They exist so a student can watch a
review skill work on someone else's writing before handing it their own, so each
one has real problems in it. Everything in them is invented, including the student
authors, and the page says so in a caution above the cards: no authority cited in
them should be relied on, and none of them is a model answer.

The section is a sibling of the writing-partner grid rather than part of it. The
set card's *download the N skills separately* button collects the download links
inside the section it names, and these are Word documents, not skills; the button's
selector is also scoped to `.skillGrid` so a future non-skill download cannot be
swept into a set either.

### Skill sets

The top of `skills.html` offers three sets as one-click downloads: the Writing Partner
Set (10), the Core Pathway Set (5), and the Tool Studios Set (6). A set is a single ZIP
holding the member skill ZIPs **byte for byte**, plus a README naming what is inside and
how to install it — so a set and the individual buttons below it hand out the same
files, and there is no second copy of a skill to keep in step.

`skills/bundles.json` says what is in each set; the ZIPs are generated, not committed by
hand:

```
python3 scripts/build-skill-bundles.py          # rebuild assets/bundles/
python3 scripts/build-skill-bundles.py --check  # non-zero if a rebuild would change a ZIP
```

Output is deterministic — fixed entry timestamps, stored (not re-compressed) members — so
rebuilding without an input change produces no git diff. To add a set: add it to the
manifest, run the script, and add a card to the Skill sets section of `skills.html`.

The second button on each card, *Download the N skills separately*, is the progressive
enhancement in `assets/skill-bundles.js`. It saves each skill ZIP individually, so they
are upload-ready with nothing to unzip. It is deliberately not the primary action: a
browser prompts before saving several files at once and some refuse outright, so the
reliable one-click path has to be the single file. The button reads its file list from
the download links already in the section it names (`data-bundle-source="#writing"`),
which means a skill added to the page is in that set download as soon as its card is.

### The teaching packet

`teach-this-writing-partner.html` is a session built entirely from what is already
on the site: set-up in ChatGPT, in Claude, and as an agent; five activities to pick
from; five sets of discussion questions with what to listen for; an explainer note
on each of the ten skills and on the case study; three run plans (60 minutes, 90
minutes, self-paced); and a glossary. It is written to be usable by faculty running
it for a class and by a student working alone, which is why every activity states
its own materials and time rather than depending on the one before it.

It is also the page that names Stanford's own ChatGPT Edu and Claude services, so
nobody sets this up on a personal account.

### The Writing Partner agent

`writing-partner-agent.html` is the set-up guide for loading all ten writing
skills into a single ChatGPT agent instead of uploading them chat by chat: create
a blank agent, name it, add the ten ZIPs (still zipped), paste in the
instructions, attach the course syllabus or style guide, and test it on a practice
draft. It says at the top, before anything else, that this is not for a course
that does not permit AI use, and it tells students to build one agent per course
and to verify every finding rather than accepting the review.

The instructions a student pastes — a role, the reviewer-not-ghostwriter boundary,
and nine human-review checkpoints — live in
`assets/writing-partner-agent-instructions.md`. That file is the source of truth
and is offered on the page as a download; the same text also sits in the page's
copy box, put there by:

```
python3 scripts/inject-agent-instructions.py          # rewrite the copy box
python3 scripts/inject-agent-instructions.py --check  # non-zero if the two differ
```

Edit the Markdown, run the script, and the page follows. The page also carries a
15-second screen recording (`assets/video/`, H.264/AAC, 1.4 MB) served directly
rather than framed from Drive like the two recordings on `install.html`, because
this one is ours to host.

### The case study

`case-study-anthropic-legal-skills.html` is a long-form reading of Anthropic's
open-source [Claude for Legal](https://github.com/anthropics/claude-for-legal)
project (Apache-2.0) and its `ai-governance-legal` plugin: what a `SKILL.md` file
is, why the plugin is ten small skills rather than one large one, what belongs in
`references/`, `scripts/`, and `assets/`, and why an open skill is not the same
thing as a legal AI platform. It is an independent educational case study, not
affiliated with or endorsed by Anthropic, and it says so at the top and the
bottom.

A 22-minute audio explainer of the same material is embedded beside the case
study on `skills.html` and again near the top of the case study itself, framed
from Google Drive rather than hosted here (the file is large, and the video on
`writing-partner-agent.html` is the size of thing worth committing). The frame
carries its duration and an "open in Google Drive" link beside it, because a
third-party frame is the one element on a page that can fail silently — a
sharing setting or a blocked frame leaves nothing behind.

It uses the document look already in the design system — `.docPage`, `.docMeta`,
`.docToc`, `.docPart`, `.module` — which the hub had inherited from the faculty
site's globals but never used. The source document drew its diagrams as ASCII
art; those are rebuilt as ordinary elements (`.layerStack`, `.flowChain`,
`.spectrumFig`, `.formulaFig`, `.codeBlock`), because ASCII art in a `<pre>`
either scrolls sideways or shrinks past legibility on a phone. The page is
entered from a card at the top of `skills.html`, above the sets: it answers
"what am I actually installing, and how was it built?" before a reader takes ten
files they have not opened.

### Shared principles

The skills use a problem-first approach and incorporate the PAUSE Rule, Stanford Law
School student AI guidance, Responsible AI at Stanford, productive struggle,
legal-source verification, structured and manageable data, transparent AI-use logs,
and accurate non-anthropomorphic explanations of AI systems.

---

For AI tools, access, legal research, or technical assistance, contact the Robert
Crown Law Library at **library@law.stanford.edu**.
