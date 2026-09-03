// =============================================================================
// AI Curiosity Corner — the upcoming hours, rendered as part of the page.
//
// The Curiosity Corner hours live on one Google Calendar. Google will happily
// hand you an iframe for it, but a framed month grid is somebody else's
// typography, somebody else's light-mode-only palette, and somebody else's idea
// of what a keyboard user should be able to reach. It also buries the one thing
// a reader actually wants — the next time they can walk in and ask a question —
// three clicks deep in a grid.
//
// So this reads the same calendar over the public Calendar API and builds a
// chronological list out of ordinary elements: real headings, a real <ol> of
// days, <time> for every date, and nothing but the site's own tokens for
// color. Light and dark come free because there is no third-party document to
// theme.
//
// Progressive by design, in the same way as assets/hub.js. The markup inside
// the container is a written-out summary of the standing hours; this file
// replaces it only once it has real events in hand. With the script blocked, the
// API unreachable, or no key configured, that summary is what stays on the page
// — never a spinner, never an empty box.
//
// Configuration comes from window.HUB_CALENDAR (assets/calendar-config.js).
// =============================================================================

(function () {
  "use strict";

  var cfg = window.HUB_CALENDAR || {};
  var container = document.getElementById("curiosity-schedule");
  if (!container) return;
  // Already in the markup, and already a live region, so writing to it is
  // announced. Optional: the list renders fine without it.
  var statusLine = document.getElementById("curiosity-status");

  var CALENDAR_ID = cfg.calendarId || "";
  var API_KEY = cfg.apiKey || "";
  var TZ = cfg.timeZone || "America/Los_Angeles";
  var TZ_LABEL = cfg.timeZoneLabel || "PT";
  var HORIZON_DAYS = cfg.horizonDays || 60;
  var MAX_EVENTS = cfg.maxEvents || 40;
  // Capped in weeks, not days, because weeks are how the list is grouped and
  // how people plan. Three is "this week, next week, the one after".
  var MAX_WEEKS_SHOWN = cfg.maxWeeksShown || 3;
  // Optional: only list events whose title contains this string. Left empty
  // because the calendar holds all of our hours and each row prints its own
  // title, so nothing is mislabeled by showing everything.
  var TITLE_FILTER = (cfg.titleFilter || "").toLowerCase();
  var CACHE_MINUTES = cfg.cacheMinutes == null ? 10 : cfg.cacheMinutes;

  // Nothing to ask for. The written summary in the markup is the whole answer.
  if (!CALENDAR_ID || !API_KEY) return;

  // ---- Formatting -----------------------------------------------------------
  // Every date and time on this list is Pacific, whatever the reader's own clock
  // says: these are hours you attend in a room in California, or on a Zoom call
  // scheduled against that room. Showing a visitor's local time would be a
  // kindness that mostly produces confusion, so the label says PT and means it.

  function fmt(options) {
    return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, options));
  }

  var dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit"
  });
  var weekdayFmt = fmt({ weekday: "long" });
  var dayDateFmt = fmt({ day: "numeric", month: "long" });
  var timeFmt = fmt({ hour: "numeric", minute: "2-digit" });

  // These two take dates built from a YYYY-MM-DD key at noon UTC, so they read
  // that key back in UTC rather than shifting it into the calendar's zone.
  var monthDayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric" });
  var dayNumFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", day: "numeric" });

  // "2:00 PM" -> ["2:00", "pm"]. Split so a range inside one meridiem can print
  // it once: "2:00–3:00pm" rather than "2:00pm–3:00pm".
  function splitTime(date) {
    var parts = timeFmt.formatToParts(date);
    var clock = "";
    var meridiem = "";
    parts.forEach(function (p) {
      if (p.type === "dayPeriod") meridiem = p.value.toLowerCase().replace(/\./g, "");
      else if (p.type !== "literal" || clock) clock += p.value;
    });
    return [clock.trim(), meridiem];
  }

  // The two halves of a range, so each can be its own <time> with its own
  // datetime. One <time> spanning "2:00–3:00pm" would be a machine-readable
  // start attached to human-readable text that is not the start.
  function rangeParts(start, end) {
    var a = splitTime(start);
    if (!end) return [a[0] + a[1], null];
    var b = splitTime(end);
    // "2:00–3:00pm" when both sides share a meridiem; "11:30am–12:30pm" when
    // they do not.
    if (a[1] === b[1]) return [a[0], b[0] + b[1]];
    return [a[0] + a[1], b[0] + b[1]];
  }

  // YYYY-MM-DD in the calendar's zone, which is what groups events into days and
  // what goes in the datetime attribute of the day heading.
  function dayKey(date) {
    return dayKeyFmt.format(date);
  }

  function addDays(date, n) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + n);
    return d;
  }

  // A day key is already a calendar date in the right zone, so weekday
  // arithmetic on it can be done in UTC — which is the only way to do it without
  // a zone offset creeping in and moving a Sunday.
  function keyToUtcDate(key) {
    return new Date(key + "T12:00:00Z");
  }

  // The Sunday that starts the week a day belongs to. US convention, matching
  // the month grid at the foot of the page.
  function weekKey(key) {
    var d = keyToUtcDate(key);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.toISOString().slice(0, 10);
  }

  // "September 3", "September 3–6", "September 28 – October 3". Written out
  // rather than assembled from dayDateFmt twice, so a week inside one month does
  // not repeat the month.
  function spanLabel(firstKey, lastKey) {
    var a = keyToUtcDate(firstKey);
    var b = keyToUtcDate(lastKey);
    var aLabel = monthDayFmt.format(a);
    if (firstKey === lastKey) return aLabel;
    if (firstKey.slice(0, 7) === lastKey.slice(0, 7)) {
      return aLabel + "–" + dayNumFmt.format(b);
    }
    return aLabel + " – " + monthDayFmt.format(b);
  }

  // ---- Reading the calendar -------------------------------------------------

  function eventsUrl(now) {
    var params = [
      "key=" + encodeURIComponent(API_KEY),
      "singleEvents=true",
      "orderBy=startTime",
      "timeMin=" + encodeURIComponent(now.toISOString()),
      "timeMax=" + encodeURIComponent(addDays(now, HORIZON_DAYS).toISOString()),
      "maxResults=" + MAX_EVENTS,
      "fields=" + encodeURIComponent("items(summary,description,location,start,end,status)")
    ];
    return "https://www.googleapis.com/calendar/v3/calendars/" +
      encodeURIComponent(CALENDAR_ID) + "/events?" + params.join("&");
  }

  // A short session cache. A reader moving between hub pages should not send a
  // fresh request each time, and the hours do not change by the minute.
  var CACHE_KEY = "hub:curiosity-corner";

  function readCache() {
    if (!CACHE_MINUTES) return null;
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var hit = JSON.parse(raw);
      if (!hit || Date.now() - hit.at > CACHE_MINUTES * 60000) return null;
      return hit.items;
    } catch (e) {
      return null;
    }
  }

  function writeCache(items) {
    if (!CACHE_MINUTES) return;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: items }));
    } catch (e) {
      // Private browsing, or a full quota. The list is already rendered; the
      // only cost is one more request on the next page.
    }
  }

  // ---- Turning API items into what the list needs ---------------------------

  function stripTags(html) {
    if (!html) return "";
    // The API returns descriptions as HTML. This never becomes markup — it is
    // read for its text and its links only, and every value below is written
    // through textContent or a checked href.
    var box = document.createElement("div");
    box.innerHTML = String(html);
    return (box.textContent || "").replace(/\s+/g, " ").trim();
  }

  // Links out of calendar text are restricted to the handful of hosts these
  // sessions actually use. The calendar is ours, but "ours" is not a reason to
  // put an unchecked URL from a remote document into the page.
  var LINK_HOSTS = /(^|\.)(?:zoom\.us|stanford\.edu|law\.stanford\.edu|google\.com)$/;

  function firstSafeUrl(text) {
    var match = String(text || "").match(/https:\/\/[^\s<>"')\]]+/g);
    if (!match) return "";
    for (var i = 0; i < match.length; i++) {
      var raw = match[i].replace(/[.,;:)\]]+$/, "");
      try {
        var url = new URL(raw);
        // Some events on the calendar carry the Zoom link as a
        // google.com/url?q= redirect, from having been pasted out of a Google
        // doc. Unwrap it and re-check the target, so the reader goes straight
        // to Zoom and the allowlist is applied to where they actually land.
        if (/(^|\.)google\.com$/.test(url.hostname) && url.pathname === "/url") {
          var target = url.searchParams.get("q") || url.searchParams.get("url");
          if (target) {
            try {
              url = new URL(target);
            } catch (e2) {
              continue;
            }
          }
        }
        if (url.protocol === "https:" && LINK_HOSTS.test(url.hostname)) return url.href;
      } catch (e) {
        // Not a URL after all.
      }
    }
    return "";
  }

  // In person, on Zoom, or both. Read off the location and description, and
  // always printed as a word — the badge has a color, but the color is never
  // the thing carrying the meaning.
  function modeOf(location, descriptionText) {
    var where = (location || "") + " " + (descriptionText || "");
    var online = /zoom|online|virtual|teams|google meet/i.test(where);
    var inPerson = /office|room|library|floor|desk|corner|in person|in-person/i.test(location || "");
    if (online && inPerson) return { key: "hybrid", label: "In person and on Zoom" };
    if (online) return { key: "online", label: "On Zoom" };
    if (inPerson) return { key: "person", label: "In person" };
    return { key: "person", label: "In person" };
  }

  function shape(item) {
    if (item.status === "cancelled") return null;

    var allDay = !(item.start && item.start.dateTime);
    var startRaw = item.start && (item.start.dateTime || item.start.date);
    var endRaw = item.end && (item.end.dateTime || item.end.date);
    if (!startRaw) return null;

    // An all-day entry has no clock to show. Anchoring it to midday in the
    // calendar's zone keeps it grouped under the right date whatever zone the
    // reader is in, which naive midnight parsing does not.
    var start = allDay ? new Date(startRaw + "T12:00:00") : new Date(startRaw);
    var end = endRaw && !allDay ? new Date(endRaw) : null;
    if (isNaN(start.getTime())) return null;

    var title = (item.summary || "AI Curiosity Corner").trim();
    if (TITLE_FILTER && title.toLowerCase().indexOf(TITLE_FILTER) === -1) return null;

    var note = stripTags(item.description);
    return {
      title: title,
      start: start,
      end: end,
      allDay: allDay,
      location: (item.location || "").trim(),
      note: note,
      joinUrl: firstSafeUrl(item.location) || firstSafeUrl(item.description),
      mode: modeOf(item.location, note)
    };
  }

  // A prefilled "new event" in the reader's own calendar. Deliberately a
  // template rather than a link to our copy of the event: a template lands in
  // their calendar with one click and no permission to negotiate.
  function addToCalendarUrl(ev) {
    function stamp(date) {
      return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    }
    var end = ev.end || new Date(ev.start.getTime() + 3600000);
    var params = [
      "action=TEMPLATE",
      "text=" + encodeURIComponent(ev.title),
      "dates=" + stamp(ev.start) + "/" + stamp(end)
    ];
    if (ev.location) params.push("location=" + encodeURIComponent(ev.location));
    if (ev.note) params.push("details=" + encodeURIComponent(ev.note.slice(0, 400)));
    return "https://calendar.google.com/calendar/render?" + params.join("&");
  }

  // ---- Building the list ----------------------------------------------------
  // Everything here goes through createElement and textContent. None of the text
  // below is ours — it comes back from a remote API — and building it as a
  // string would put the safety of the page in the hands of whoever last edited
  // an event title.

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function externalLink(href, text, className) {
    var a = el("a", className, text);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    var icon = el("span", "externalLinkIcon", "↗");
    icon.setAttribute("aria-hidden", "true");
    a.appendChild(icon);
    a.appendChild(el("span", "srOnly", " (opens in a new tab)"));
    return a;
  }

  function setStatus(text, empty) {
    if (!statusLine) return;
    statusLine.textContent = text;
    statusLine.classList.toggle("ccStatus--empty", !!empty);
  }

  function relativeLabel(key, todayKey, tomorrowKey) {
    if (key === todayKey) return "Today";
    if (key === tomorrowKey) return "Tomorrow";
    return "";
  }

  function slotItem(ev, now) {
    var li = el("li", "ccSlot");
    var live = ev.end && ev.start <= now && now < ev.end;
    if (live) li.classList.add("isLive");

    var head = el("div", "ccSlotHead");

    var when = el("p", "ccSlotTime");
    if (ev.allDay) {
      when.appendChild(el("span", null, "All day"));
    } else {
      var parts = rangeParts(ev.start, ev.end);
      var from = el("time", null, parts[0]);
      from.dateTime = ev.start.toISOString();
      when.appendChild(from);
      if (parts[1]) {
        when.appendChild(document.createTextNode("–"));
        var to = el("time", null, parts[1]);
        to.dateTime = ev.end.toISOString();
        when.appendChild(to);
      }
      when.appendChild(document.createTextNode(" "));
      when.appendChild(el("span", "ccTzLabel", TZ_LABEL));
    }
    head.appendChild(when);

    // "Happening now" is a fact about this row, so it is announced rather than
    // left as a styling difference somebody has to see to notice.
    if (live) {
      var nowPill = el("span", "ccLive");
      nowPill.appendChild(el("span", "ccLiveDot"));
      nowPill.lastChild.setAttribute("aria-hidden", "true");
      nowPill.appendChild(el("span", null, "Happening now"));
      head.appendChild(nowPill);
    }

    li.appendChild(head);
    // h5, under the week (h3) and the day (h4), under the section's h2. Deep,
    // but it is the real outline, and it is what lets a screen reader jump
    // session to session.
    li.appendChild(el("h5", "ccSlotTitle", ev.title));

    var where = el("p", "ccSlotWhere");
    where.appendChild(el("span", "ccMode ccMode--" + ev.mode.key, ev.mode.label));
    // A location field on these events is often "Reference Office and Zoom:
    // https://…". The URL is already the "Join on Zoom" link below, so printing
    // it again as bare text just makes the line unreadable.
    var placeText = ev.location
      .replace(/\b(?:https?|webcal):\/\/\S+/gi, "")
      .replace(/\s+/g, " ")
      .replace(/[\s,;:—-]+$/, "")
      .trim();
    if (placeText) {
      where.appendChild(document.createTextNode(" "));
      where.appendChild(el("span", "ccWhereText", placeText));
    }
    li.appendChild(where);

    if (ev.note) {
      var note = ev.note.length > 220 ? ev.note.slice(0, 217).trim() + "…" : ev.note;
      li.appendChild(el("p", "ccSlotNote", note));
    }

    var actions = el("p", "ccSlotActions");
    actions.appendChild(externalLink(addToCalendarUrl(ev), "Add to my calendar", "ccAction"));
    if (ev.joinUrl) {
      var join = externalLink(ev.joinUrl, "Join on Zoom", "ccAction ccAction--join");
      // Two "Join on Zoom" links on a page need to be told apart by anyone
      // reading the list of links out of context.
      join.setAttribute("aria-label", "Join on Zoom: " + ev.title);
      actions.appendChild(join);
    }
    li.appendChild(actions);

    return li;
  }

  function dayItem(key, events, now, todayKey, tomorrowKey) {
    var li = el("li", "ccDay");
    var first = events[0].start;

    var heading = el("h4", "ccDayHead");
    heading.appendChild(el("span", "ccDayName", weekdayFmt.format(first)));
    var date = el("time", "ccDayDate", dayDateFmt.format(first));
    date.dateTime = key;
    heading.appendChild(date);
    var rel = relativeLabel(key, todayKey, tomorrowKey);
    if (rel) heading.appendChild(el("span", "ccDayRel", rel));
    li.appendChild(heading);

    var slots = el("ul", "ccSlots");
    events.forEach(function (ev) {
      slots.appendChild(slotItem(ev, now));
    });
    li.appendChild(slots);
    return li;
  }

  // A week of days. This is the grouping the board that used to sit here did by
  // hand: "this week" is the question most people are actually asking, and a
  // flat run of fifteen days does not answer it at a glance.
  function weekItem(week, thisWeekKey, nextWeekKey, byDay, now, todayKey, tomorrowKey) {
    var li = el("li", "ccWeek");
    if (week.key === thisWeekKey) li.classList.add("isCurrent");

    var label;
    var named = true;
    if (week.key === thisWeekKey) label = "This week";
    else if (week.key === nextWeekKey) label = "Next week";
    else {
      label = "Week of " + monthDayFmt.format(keyToUtcDate(week.key));
      named = false;
    }

    var heading = el("h3", "ccWeekHead");
    heading.appendChild(el("span", "ccWeekLabel", label));
    // "This week" and "Next week" say nothing about which dates those are, so
    // they always carry the span. A "Week of September 20" heading already
    // anchors itself, so it only earns a span when there is a range to add.
    if (named || week.days.length > 1) {
      heading.appendChild(el(
        "span",
        "ccWeekRange",
        spanLabel(week.days[0], week.days[week.days.length - 1])
      ));
    }
    var sessions = week.days.reduce(function (n, k) { return n + byDay[k].length; }, 0);
    heading.appendChild(el("span", "srOnly", ", " + sessions + (sessions === 1 ? " session" : " sessions")));
    li.appendChild(heading);

    var days = el("ol", "ccDayList");
    week.days.forEach(function (key) {
      days.appendChild(dayItem(key, byDay[key], now, todayKey, tomorrowKey));
    });
    li.appendChild(days);
    return li;
  }

  function subscribeActions() {
    var wrap = el("div", "ccSubscribe");
    wrap.appendChild(el("p", "ccSubscribeLead", "Never miss one:"));
    var list = el("p", "ccSubscribeLinks");
    list.appendChild(externalLink(
      "https://calendar.google.com/calendar/render?cid=" + encodeURIComponent(CALENDAR_ID),
      "Add the whole calendar to Google Calendar",
      "ccAction"
    ));
    // webcal:// hands the same feed to Apple Calendar and Outlook, which
    // subscribe rather than import — so added hours turn up on their own. This
    // one is not an externalLink: it opens a calendar app, not a tab, so the
    // "opens in a new tab" promise the other links make would be wrong.
    var feed = el("a", "ccAction", "Subscribe in Outlook or Apple Calendar");
    feed.href = "webcal://calendar.google.com/calendar/ical/" +
      encodeURIComponent(CALENDAR_ID) + "/public/basic.ics";
    feed.appendChild(el("span", "srOnly", " (opens in your calendar app)"));
    list.appendChild(feed);
    wrap.appendChild(list);
    return wrap;
  }

  function render(events) {
    var now = new Date();
    var todayKey = dayKey(now);
    var tomorrowKey = dayKey(addDays(now, 1));

    // Drop what has already finished. timeMin keeps most of it out, but a
    // session that ended while the page sat open should not stay on the list.
    var upcoming = events.filter(function (ev) {
      return (ev.end || ev.start) >= now;
    });
    if (!upcoming.length) return false;

    var order = [];
    var byDay = {};
    upcoming.forEach(function (ev) {
      var key = dayKey(ev.start);
      if (!byDay[key]) {
        byDay[key] = [];
        order.push(key);
      }
      byDay[key].push(ev);
    });

    // Days into weeks, in order. A week with nothing on it never appears, so a
    // quiet fortnight produces no empty headings — only weeks that have
    // something in them are counted against the cap.
    var allWeeks = [];
    var byWeek = {};
    order.forEach(function (key) {
      var wk = weekKey(key);
      if (!byWeek[wk]) {
        byWeek[wk] = { key: wk, days: [] };
        allWeeks.push(byWeek[wk]);
      }
      byWeek[wk].days.push(key);
    });

    var weeks = allWeeks.slice(0, MAX_WEEKS_SHOWN);
    var shown = weeks.reduce(function (days, week) {
      return days.concat(week.days);
    }, []);

    var thisWeekKey = weekKey(todayKey);
    var nextWeekKey = weekKey(dayKey(addDays(now, 7)));

    var frag = document.createDocumentFragment();

    var count = shown.reduce(function (n, key) { return n + byDay[key].length; }, 0);
    var lastDay = byDay[shown[shown.length - 1]][0].start;
    setStatus(
      count === 1
        ? "One session coming up, " +
          (shown[0] === todayKey ? "today" : "on " + weekdayFmt.format(byDay[shown[0]][0].start)) + "."
        : count + " sessions between now and " + dayDateFmt.format(lastDay) + "."
    );

    var list = el("ol", "ccWeekList");
    weeks.forEach(function (week) {
      list.appendChild(
        weekItem(week, thisWeekKey, nextWeekKey, byDay, now, todayKey, tomorrowKey)
      );
    });
    frag.appendChild(list);

    if (allWeeks.length > weeks.length) {
      frag.appendChild(el(
        "p",
        "ccMore",
        "More is scheduled beyond " + dayDateFmt.format(lastDay) +
          " — the month grid at the foot of this page has the full run."
      ));
    }

    frag.appendChild(subscribeActions());

    container.textContent = "";
    container.appendChild(frag);
    container.classList.add("isLoaded");
    container.removeAttribute("aria-busy");
    return true;
  }

  // ---- Go -------------------------------------------------------------------

  function shapeAll(items) {
    return (items || []).map(shape).filter(Boolean).sort(function (a, b) {
      return a.start - b.start;
    });
  }

  var cached = readCache();
  if (cached) {
    // A cached payload is raw API items, so a stale entry that has since ended
    // is filtered out by render() rather than trusted.
    if (render(shapeAll(cached))) return;
  }

  container.setAttribute("aria-busy", "true");

  fetch(eventsUrl(new Date()), { headers: { Accept: "application/json" } })
    .then(function (response) {
      if (!response.ok) throw new Error("Calendar API responded " + response.status);
      return response.json();
    })
    .then(function (data) {
      var items = data.items || [];
      writeCache(items);
      if (!render(shapeAll(items))) {
        // The calendar answered and has nothing coming up. The written summary
        // of the standing hours is a better thing to leave on the page than an
        // empty list, so it stays — with a line saying why it is all there is.
        container.removeAttribute("aria-busy");
        setStatus(
          "No sessions are on the calendar for the next " + HORIZON_DAYS + " days. " +
            "The standing hours below still apply, and you can always email us for an appointment.",
          true
        );
      }
    })
    .catch(function (error) {
      // Leaving the written hours in place is the whole point of putting them in
      // the markup. Nothing is said to the reader, because nothing they can act
      // on has changed.
      container.removeAttribute("aria-busy");
      if (window.console && console.warn) {
        console.warn("Curiosity Corner hours could not be loaded:", error.message);
      }
    });
})();
