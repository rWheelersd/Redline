
(function () {
  "use strict";

  const COPY = "Shoot idea";
  const STORAGE_KEY = "redline-calendar-demo-v1";
  const DURATIONS = new Set([30, 60, 90, 120]);
  const TONES = new Set(["purple", "blue", "green"]);

  function localDay(year, month, day) {
    return new Date(year, month, day, 12);
  }

  function dateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function parseDateKey(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = localDay(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month &&
      date.getDate() === day ? date : null;
  }

  function addDays(date, amount) {
    return localDay(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  }

  function startOfWeek(date) {
    return addDays(date, -date.getDay());
  }

  function moveMonth(date, amount) {
    const target = localDay(date.getFullYear(), date.getMonth() + amount, 1);
    const lastDay = localDay(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    return localDay(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
  }

  function daysInView(date, view) {
    if (view === "week") {
      const first = startOfWeek(date);
      return Array.from({ length: 7 }, (_, index) => addDays(first, index));
    }

    const firstOfMonth = localDay(date.getFullYear(), date.getMonth(), 1);
    const first = startOfWeek(firstOfMonth);
    const lastDate = localDay(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const cells = Math.max(35, Math.ceil((firstOfMonth.getDay() + lastDate) / 7) * 7);
    return Array.from({ length: cells }, (_, index) => addDays(first, index));
  }

  function validTime(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    return Boolean(match && Number(match[1]) <= 23 && Number(match[2]) <= 59);
  }

  function normalEvent(value) {
    if (!value || typeof value !== "object" || !parseDateKey(value.date) ||
        !validTime(value.time) || !DURATIONS.has(value.duration) ||
        typeof value.id !== "string") return null;
    return {
      id: value.id,
      date: value.date,
      time: value.time,
      duration: value.duration,
      tone: TONES.has(value.tone) ? value.tone : "purple"
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { localDay, dateKey, parseDateKey, addDays, startOfWeek, moveMonth, daysInView };
  }
  if (typeof document === "undefined") return;

  const byId = (id) => document.getElementById(id);
  const grid = byId("calendarGrid");
  const title = byId("calendarTitle");
  const previous = byId("previousPeriod");
  const next = byId("nextPeriod");
  const todayButton = byId("todayButton");
  const weekButton = byId("weekView");
  const monthButton = byId("monthView");
  const newButton = byId("newEventButton");
  const dialog = byId("eventDialog");
  const form = byId("eventForm");
  const dateInput = byId("eventDate");
  const timeInput = byId("eventTime");
  const durationInput = byId("eventDuration");
  const deleteButton = byId("deleteEvent");
  const cancelButton = byId("cancelEvent");

  if ([grid, title, previous, next, todayButton, weekButton, monthButton,
       newButton, dialog, form, dateInput, timeInput, durationInput,
       deleteButton, cancelButton].some((node) => !node)) {
    console.error("Calendar markup is incomplete. Use the matching calendar.html file.");
    return;
  }

  function saveEvents() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events)); }
    catch (_) {  }
  }

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 200).map(normalEvent).filter(Boolean);
      }
    } catch (_) {  }
    return [];
  }

  const now = new Date();
  const state = {
    focusDate: localDay(now.getFullYear(), now.getMonth(), now.getDate()),
    view: "month",
    events: loadEvents(),
    editingId: null,
    opener: null
  };
  saveEvents();

  const fullDate = new Intl.DateTimeFormat(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const monthYear = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
  const shortDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

  function formatTime(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return timeFormatter.format(new Date(2020, 0, 1, hours, minutes));
  }

  function periodTitle() {
    if (state.view === "month") return monthYear.format(state.focusDate);
    const first = startOfWeek(state.focusDate);
    const last = addDays(first, 6);
    if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
      return `${shortDate.format(first)}–${last.getDate()}, ${last.getFullYear()}`;
    }
    if (first.getFullYear() !== last.getFullYear()) {
      return `${shortDate.format(first)}, ${first.getFullYear()} – ${shortDate.format(last)}, ${last.getFullYear()}`;
    }
    return `${shortDate.format(first)} – ${shortDate.format(last)}, ${last.getFullYear()}`;
  }

  function openEditor(event, day, opener) {
    state.editingId = event ? event.id : null;
    state.opener = opener;
    dateInput.value = event ? event.date : dateKey(day);
    timeInput.value = event ? event.time : "09:00";
    durationInput.value = String(event ? event.duration : 60);
    deleteButton.hidden = !event;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dateInput.focus();
  }

  function closeEditor() {
    if (typeof dialog.close === "function") dialog.close();
    else {
      dialog.removeAttribute("open");
      state.opener?.focus();
    }
  }

  function render() {
    title.textContent = periodTitle();
    previous.setAttribute("aria-label", `Previous ${state.view}`);
    next.setAttribute("aria-label", `Next ${state.view}`);
    for (const [button, view] of [[weekButton, "week"], [monthButton, "month"]]) {
      const selected = state.view === view;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }

    const eventsByDay = new Map();
    for (const event of state.events) {
      if (!eventsByDay.has(event.date)) eventsByDay.set(event.date, []);
      eventsByDay.get(event.date).push(event);
    }
    for (const events of eventsByDay.values()) events.sort((a, b) => a.time.localeCompare(b.time));

    const fragment = document.createDocumentFragment();
    const sunday = localDay(2023, 0, 1);
    for (let index = 0; index < 7; index++) {
      const heading = document.createElement("div");
      heading.className = "weekday";
      heading.textContent = weekday.format(addDays(sunday, index));
      fragment.append(heading);
    }

    const today = dateKey(new Date());
    for (const day of daysInView(state.focusDate, state.view)) {
      const key = dateKey(day);
      const cell = document.createElement("div");
      cell.className = "day";
      if (state.view === "month" && day.getMonth() !== state.focusDate.getMonth()) cell.classList.add("outside");
      if (key === today) cell.classList.add("today");

      const dateButton = document.createElement("button");
      dateButton.type = "button";
      dateButton.className = "date";
      dateButton.textContent = String(day.getDate());
      dateButton.setAttribute("aria-label", `Add event on ${fullDate.format(day)}`);
      if (key === today) dateButton.setAttribute("aria-current", "date");
      dateButton.addEventListener("click", () => openEditor(null, day, dateButton));
      cell.append(dateButton);

      for (const event of eventsByDay.get(key) || []) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `event ${event.tone}`;
        button.setAttribute("aria-label", `${COPY} ${fullDate.format(day)}, ${formatTime(event.time)}`);

        const time = document.createElement("span");
        time.className = "event-time";
        time.textContent = formatTime(event.time);
        const copy = document.createElement("span");
        copy.className = "event-copy";
        copy.textContent = COPY;
        button.append(time, copy);
        button.addEventListener("click", () => openEditor(event, day, button));
        cell.append(button);
      }
      fragment.append(cell);
    }
    grid.replaceChildren(fragment);
  }

  previous.addEventListener("click", () => {
    state.focusDate = state.view === "month" ? moveMonth(state.focusDate, -1) : addDays(state.focusDate, -7);
    render();
  });
  next.addEventListener("click", () => {
    state.focusDate = state.view === "month" ? moveMonth(state.focusDate, 1) : addDays(state.focusDate, 7);
    render();
  });
  todayButton.addEventListener("click", () => {
    const date = new Date();
    state.focusDate = localDay(date.getFullYear(), date.getMonth(), date.getDate());
    render();
  });
  weekButton.addEventListener("click", () => { state.view = "week"; render(); });
  monthButton.addEventListener("click", () => { state.view = "month"; render(); });
  newButton.addEventListener("click", () => openEditor(null, state.focusDate, newButton));
  cancelButton.addEventListener("click", closeEditor);
  dialog.addEventListener("close", () => {
    if (state.opener?.isConnected) state.opener.focus();
    else newButton.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = parseDateKey(dateInput.value);
    const time = timeInput.value;
    const duration = Number(durationInput.value);
    if (!date || !validTime(time) || !DURATIONS.has(duration)) {
      form.reportValidity();
      return;
    }

    const existing = state.events.find((item) => item.id === state.editingId);
    if (existing) {
      Object.assign(existing, { date: dateKey(date), time, duration });
    } else {
      state.events.push({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        date: dateKey(date), time, duration, tone: "purple"
      });
    }
    saveEvents();
    state.focusDate = date;
    closeEditor();
    render();
  });

  deleteButton.addEventListener("click", () => {
    if (!state.editingId || !window.confirm("Delete this date from your planner?")) return;
    state.events = state.events.filter((item) => item.id !== state.editingId);
    saveEvents();
    closeEditor();
    render();
  });

  render();
})();
