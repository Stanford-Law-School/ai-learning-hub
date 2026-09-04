# The AI Learning Hub

The Robert Crown Law Library's AI Learning Hub for Stanford Law School, plus the
student-facing AI Skills it distributes.

The hub is **open to the whole SLS community** — students, staff, and faculty — and
requires no sign-in. That is the difference between this site and
[`ai-faculty-support`](https://github.com/Stanford-Law-School/ai-faculty-support),
which is written for faculty, answers on its own hostname at
`https://ai-faculty.law.stanford.edu/`, and sits behind Stanford authentication. The
two sites share one design system so they read as one family.

They are otherwise entirely separate: separate repositories, separate deployments,
separate dependencies, and separate authentication. Nothing of the faculty site is
copied here, and this site holds no credential of any kind. The only thing joining
them is a pair of ordinary links — the "Faculty Support" entry in this site's
navigation points at the faculty site, and the faculty site's header points back.

The same holds for
[`The-AI-Upload`](https://github.com/whuggins-RCLL/the-ai-upload), the Library's
weekly AI news digest: its own repository and deployment, `ai-upload.html` here
points at it, and its header points back. Both sibling sites were embedded in this
one until SLS IT prohibited embedding the faculty site; both are now reached by an
ordinary link, and nothing here frames either.

The site is read directly at `https://ailearninghub.law.stanford.edu`. It used to
be read inside Google Sites, one full-page frame per hub page, which needed a
generated map of Google Sites paths and a runtime that rewrote every internal link
to move the browser out of the frame. **That layer is gone** — `assets/embed.js`,
`assets/embed-map.js`, `scripts/build-embed-map.py`, and `embed-codes.html` are
deleted, no page loads an embed runtime, and links between hub pages are ordinary
links again. Nothing frames this site, and nothing here frames another.

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
| `tutorials.html` | The tutorial library — three tutorials, and the list they are rendered from |
| `ai-for-beginners.html` | Introduction to AI for Beginners: the ten-part course |
| `ai-explained.html` | AI Explained Using Analogies: nineteen concepts, one disclosure each |
| `ai-playground.html` | Guide to the Stanford AI Playground: use, models, agents, and limits |
| `ai-resources.html` | AI tools available to the SLS community, and the policy that governs them |
| `ai-in-the-library.html` | The library's AI display: 7 parts, 24 panels, 32 books |
| `reading-list.html` | The 32-book shelf on its own page (same data as the display) |
| `assets/books.js` | Shared reading-list data and card renderer |
| `assets/ai-reading-list.pdf` | The same shelf as a printable PDF, with clickable SearchWorks links |
| `scripts/generate-reading-list-pdf.py` | Builds that PDF from `assets/books.js` |
| `events.html` | The upcoming schedule, what the Curiosity Corner is, trainings, and the calendar |
| `assets/curiosity-corner.js` | Draws the next three weeks of the AI calendar as a native list |
| `assets/calendar-config.js` | Which calendar it reads; the API key is injected at deploy time |
| `scripts/build-calendar-config.mjs` | Writes that key in from the Amplify environment |
| `past-events.html` | Archive of past sessions, each linking to its own materials page |
| `event-*.html` | One page per past session: slides, instructions, and files |
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
| `digital-wellness.html` | Digital Wellness — the three themes, and the guide to reducing Gemini and AI features in Google tools |
| `assets/images/reduce-gemini-google-tools-page-1.png` | First-page preview of that guide, rendered from the Google Docs PDF export |
| `faculty-publications.html` | Fallback page linking out to Stanford Law School faculty publications on AI |
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
| `vercel.json` | Who is allowed to frame the site: this origin and no one else |

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

Digital Wellness is not in the bar either, and adding it would mean either a
seventh destination or dropping one of the six. It is reached from a card in the
landing page's featured row and from site search, which is the pattern for a
section somebody looks for rather than a route they need kept open.

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
npm run search:index          # write assets/search-index.js
npm run search:index:check    # non-zero if it is out of date
```

Re-run it after editing page content and commit the result. It is the one script
here that needs Playwright, so Playwright is kept as a local development
dependency. The index is currently 557 entries and about 426 kB, loaded on
`search.html` alone and nowhere else.

Matching is prefix-per-word ("cita" finds "citation", "ation" does not), all terms
must appear, and a heading hit outweighs a passing mention. Snippets are built as
text nodes and `<mark>` elements rather than markup, so a query can never become
HTML.

### The Curiosity Corner hours

`events.html` opens with the schedule. `assets/curiosity-corner.js` reads the
library's AI calendar over the public Google Calendar API and lays the next three
weeks out as nested lists built from the site's own elements: an `<ol>` of weeks, each
holding an `<ol>` of days, each holding its sessions. A session carries its times as
`<time>` elements, an "In person" / "On Zoom" / "In person and on Zoom" badge, a
"Happening now" label when it is in progress, a one-click "Add to my calendar" link,
and a Zoom link when the event has one. Below the list, two subscribe links put every
future session on the reader's own calendar. Then comes what the Curiosity Corner
actually is — drop-in, one to one, no appointment, who it is for, what to bring.

**The schedule leads the page, and it is grouped by week.** Both of those replace a
framed Apps Script board that used to sit third on the page under the heading "This
week at a glance". It answered the question most readers arrive with, and it did it
below two other sections, in a 560px-tall iframe, in its own type. The native list
answers the same question in the first screenful. Weeks are the unit because "what is
on this week" is the actual question; a flat run of a dozen days does not answer it at
a glance. The current week gets the stronger surface, and its heading says "This
week", so the emphasis is not carried by the tint alone. Weeks with nothing on them
never appear, so a quiet stretch produces no empty headings — and only weeks with
something in them count against the three.

The **SLS Tech Club** section — the club charter, the mission statement, the
governance notes, and the Slack link — is off this page, as is the framed
week-at-a-glance board. Events is now about what the library runs and when you can
turn up to it, and a monthly club's charter is not that.
The Tech Club is off `past-events.html` too — the six meeting cards and the charter
paragraph are deleted, not moved. Nothing on the site advertises the club now, which
is the finished state rather than a step toward one.

The Google Calendar iframe stays at the foot of the page as the month grid, for
looking further ahead than three weeks, and the list points at it when there is more
beyond its last week. It is no longer how the hours are marketed: a framed month grid
is a second stylesheet that cannot be told which theme it is in, ignores our type, and
buries the next available session three clicks deep. Everything above it is ours, so
light mode, dark mode, keyboard focus, and the print stylesheet all work the way they
do everywhere else on the site.

**It degrades to prose, not to a spinner.** The container in the markup holds a
written summary of the standing hours. The script replaces that only once it has real
events in hand, so with JavaScript blocked, the API unreachable, no key configured, or
nothing on the calendar for the next sixty days, a reader still gets an answer to
"when can I come in". Times are always printed in `America/Los_Angeles` and labeled
`PT`, because these are hours in a room in California; a visitor's local time would be
a kindness that mostly produces confusion.

That summary is hand-written from the recurring entries on the calendar, so it is the
one part of this that can drift — update it when the standing pattern changes. As of
now the pattern is three weekly in-person sessions in the Reference Office: Mondays
12:30–1:30pm, Tuesdays 1–2pm, and Thursdays 12–1pm PT. The copy this page and
`ai-in-the-library.html` used to carry said "Thursdays 2–3pm" and "twice weekly",
which the calendar had already moved past; both are corrected.

Nothing from the API is ever treated as markup. Every value goes into the page through
`createElement` and `textContent`, and a URL out of an event's location or description
is linked only if it is `https` and on a short host allowlist (`zoom.us`,
`stanford.edu`, `law.stanford.edu`, `google.com`). Some events carry their Zoom link as
a `google.com/url?q=` redirect, from having been pasted out of a Google doc; those are
unwrapped and the allowlist is re-applied to the target, so the reader goes straight to
Zoom and the check is made against where they actually land. Most events keep the Zoom
link in the location field, so the bare URL is stripped out of the location text once
it has become the "Join on Zoom" link — printing it twice made the line unreadable.

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

### Digital Wellness

`digital-wellness.html` states what the section is for — three themes, written as
short explanations rather than links — and carries the one resource that exists so
far: the library's own guide to reducing Gemini and AI features in Google tools. The
themes are deliberately not clickable tiles. A tile that looks like a destination
promises pages that are not written yet; when a theme has its own material, it can
become a link then.

The guide itself lives in Google Docs and is not copied here. The page offers the two
routes to it — the PDF export, which Google serves with
`Content-Disposition: attachment` so the link downloads rather than opening a tab,
and the document itself. Neither is framed: no iframe, no document viewer.

What *is* committed is a preview of the first page,
`assets/images/reduce-gemini-google-tools-page-1.png`, at 639px for a slot that is
never wider than 300, so it stays sharp on a 2x screen. It was rendered from the PDF
export on macOS and is the one image asset here that is not vector:

```
curl -L "https://docs.google.com/document/d/<id>/export?format=pdf" -o guide.pdf
qlmanage -t -s 828 -o . guide.pdf
```

Re-render it if the document's first page changes; a stale preview is worse than
none, because it shows a reader something the download does not contain.

The card on the landing page links to `digital-wellness` rather than
`digital-wellness.html`, because the clean path is how the page is addressed
publicly and Vercel serves every page at its extensionless path. The rest of the
site still links with `.html`; new visitor-facing links should not.

### The tutorials

`tutorials.html` used to be a list of about thirty-four cards, and almost every one
of them pointed out of the site to a page on the library's Google Site. Those pages
are being rewritten as hub pages; three are done and only those three are listed:

| Page | What it is |
| --- | --- |
| `ai-for-beginners.html` | The ten-part introduction: what generative AI is, how it works, what it can create, responsible use, prompting, interfaces, data, the tools we do not recommend, and where the field is going |
| `ai-explained.html` | Nineteen concepts explained by analogy, one `<details>` each |
| `ai-playground.html` | The Stanford AI Playground: how to use it, which model to pick, what the agents do, and what it leaves out |

The rest are not linked from anywhere rather than linked somewhere that is being
retired. **The old entries are in the git history** — each carries its title,
category, and description, which is most of the work of rebuilding the card when its
page exists again.

Three decisions worth knowing, because they will come up again for the next one:

- **Nothing is restated.** Where the source page duplicated something the hub already
  has, the port links instead: part five summarizes the PAUSE framework and sends the
  reader to `pause-rule.html`, the analogies that appear in both pages live on
  `ai-explained.html` and are linked from the course by anchor, and the block of
  library-services promotion on the source's first page became one line pointing at
  `events.html` and `ai-upload.html`. That block also advertised the Tech Club, which
  this site deliberately retired; a port is not a route for bringing something back.
- **The hero images did not come across**, by request, and neither did the screenshots
  the source hotlinked from a free image host. The prose stands without them. If any
  of those screenshots are worth having, they should be re-taken and committed to
  `assets/images/` like every other asset here.
- **The videos did.** All eight Google Drive recordings are the library's own and are
  publicly shared, so they are embedded in `.tutorialVideo` frames exactly as
  `api-course.html` does it.

`ai-explained.html` has one structural oddity worth not undoing. Each analogy is a
`<details>` wrapped in a `<div>` that carries the anchor id, and the concept name is
an `<h3>` inside the `<summary>`. That is for the search index: it buckets by the
nearest id'd container and titles each entry from that container's first heading, so
the wrapper turns one undifferentiated page entry into nineteen that link to the right
analogy. Flattening it back to a bare `<details id="...">` costs eighteen search
results.

### The past events archive

`past-events.html` is the index; each session that has materials has its own page,
named `event-<slug>.html`:

| Page | Session |
| --- | --- |
| `event-assessing-ai-output.html` | Assessing Output in CoCounsel and Protégé — the VET process and an evaluation checklist |
| `event-ai-writing-partner.html` | Creating a Personalized AI Writing Partner — the five-step roadmap and the ethics of it |
| `event-notebooklm-trends.html` | Identifying Trends in a Corpus of Documents Using NotebookLM — limits, cautions, and plan caps |
| `event-lightning-workshops.html` | Session Two: seven breakout rooms, each with its trained chat, instructions, and Drive folder |
| `event-staff-introduction.html` | Session One: the first staff introduction, which is the deck |

Each page carries a `.tutorialCurrency stale` note saying when the session was given,
because these date faster than anything else here — one of them assumes a paid ChatGPT
account for things that are now free. Each also carries the session's own privacy
warning, which is the one piece of repetition on the site that is worth having on every
page rather than one click away.

The slide decks are inline in an `.embedPanel.slides` — a bounded 16:9 panel showing
one third-party thing, which is the only kind of frame this site uses — with the `.pptx`
export and the Slides link beside it as ordinary buttons.

Two things deliberately did not come across:

- **The Tech Club.** Six meeting cards and the club's charter paragraph are gone, and
  the source archive's "upcoming Tech Club meeting" block with them.
- **Every "materials coming soon" card.** Two sessions had no materials and said so;
  they are deleted rather than listed. One session — Professional Writing Workflows —
  keeps its card because it happened, but has no button, because its materials live in
  the Editing with AI tutorial that has not been ported yet. It gets one then.

The source page also carried a Zoom join link with the passcode in the query string for
a meeting held in August 2025. That was not carried over, and a live meeting credential
should not be published on this site at all.

### Content that is data, not markup

Two pages keep their content in one array at the bottom of the file and render the
cards from it, because both are lists that grow and an entry beats a block of copied
HTML: `tutorials.html` (its three tutorials) and `ai-in-the-library.html` (7 categories, 24
panels). The previous hub's tutorials page worked the same way. Everything else is
written out as HTML.

The thirty-two books are different: they live once in `assets/books.js` and are
rendered by both `reading-list.html` and the Selected Reading section of
`ai-in-the-library.html`. Edit the array in that file to update both pages.

### Your AI Stack

`your-ai-stack.html` was its own repository — `whuggins-RCLL/Your-AI-Stack`, a Vite +
React + Tailwind app, reached through a wrapper page rather than living here.
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

**Faculty Support is a link straight out of this site.** It goes to
`https://ai-faculty.law.stanford.edu/` — the faculty application, on its own
hostname, behind Stanford sign-in, and not a page in this repository. The entry is
in `NAV` in `scripts/nav.py`, which gives any `https://` destination
`target="_blank"` and the external-link marker, so it is written once and appears
in the header of every page. The landing page carries the same link on its
`.crossPromo` card.

**The hostname is the architecture, and it has moved twice.** The faculty site was
originally a Vercel address, then briefly `/faculty` on this domain, and is now
`ai-faculty.law.stanford.edu`. The separate origin is the point: an SSO-protected
application does not get mounted inside an origin that has to stay public, and a
path on this domain would have meant proxying protected content through the public
hub. Apache proxies that hostname to the faculty app's own origin. Nothing on this
side proxies, rewrites, or frames it — the outbound link is the whole integration.

There used to be a page in between. `faculty.html` was an ordinary hub page that
described the faculty site, listed who could sign in, pointed students at
`skills.html`, and then handed the reader on. **It is deleted** — it was causing
problems in practice, and the round trip through it bought faculty and staff
nothing but a click. Two consequences worth knowing:

- **The landing-page card is now the only place the eligibility rules live.** Who
  may sign in, that personal Google accounts are refused, how to request access,
  and where to email if sign-in fails are all in the card copy on `index.html`
  rather than a click away. If that card is ever rewritten, they have to go
  somewhere, not just go.
- **A student who clicks Faculty Support meets a Stanford sign-in page** rather
  than an explanation and a pointer to `skills.html`. That is the accepted cost of
  removing the page. The card's aside — *"Faculty and staff only. Students, the AI
  Skills are on this site."* — is what warns them beforehand.

It is a link and not an embed, deliberately and permanently. The faculty site is a
separate application with its own Firebase sign-in; SLS IT has prohibited embedding
it here. Do not reintroduce an iframe, an embedded webview, or client-side
injection of its markup to get the same effect.

`target="_blank"` on that link is load-bearing rather than stylistic. A new
top-level tab is where Stanford sign-in is most reliable: the redirect chain runs
at the top level, and a sign-in flow inside a frame is the case browsers restrict.

`ai-upload.html` gets the same treatment. It was once a full-page frame holding The
AI Upload; it is now a landing page that says what the digest is, what is in an
issue, and links to it with the same `target="_blank"`. The digest needs no
sign-in, so it carries no eligibility rules and no student referral — which is why
it survives as a page where the faculty one did not.

**Nothing on this site frames another site any more, and nothing frames this one.**
`body.hasEmbed` and `.embedFrame` are deleted, and so is `.digestEmbed`, which the
faculty site used for its own frame around the same digest. `vercel.json` and
`customHttp.yml` allow `frame-ancestors 'self'` and nothing else. The remaining
frames are bounded media, slide, and event calendar panels. A frame around
somebody else's site is not a pattern to reintroduce.

The home page card for SLS faculty publications links directly to the Stanford
Law School publications page. `faculty-publications.html` is only a fallback for
old links and sends readers onward without embedding the external page.

### How the site is served

Vercel builds and serves the repository, and `https://ailearninghub.law.stanford.edu`
answers from it directly. There is no wrapper, no frame, and nothing to keep in step:
adding a page to the hub is adding an HTML file and running `scripts/nav.py`.

Vercel also serves every page at its extensionless path, so `/digital-wellness` is
`digital-wellness.html`. That is the form to use in a visitor-facing link.

`vercel.json` (and `customHttp.yml`, for Amplify) carries one header: a
`frame-ancestors 'self'` policy, so no other origin may frame the site. It was
briefly wider, to let Google Sites frame each page; that arrangement is over.

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
