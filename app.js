/* My Diary — a personal web diary backed by Supabase. */

const SUPABASE_URL = "https://ikrborprotbvygphjphl.supabase.co";
const SUPABASE_KEY = "sb_publishable_hznZZS64hstnR49UiG5btg_b0330tiY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);

/* ===== Internationalization ===== */

const I18N = {
  en: {
    appName: "My Diary",
    tagline: "A quiet place for your days.",
    loginGithub: "Continue with GitHub",
    loginGoogle: "Continue with Google",
    tabWrite: "Write",
    tabDiary: "Full Diary",
    signOut: "Sign out",
    todaysEntry: "Today's entry",
    editEntry: "Edit entry",
    date: "Date",
    whatHappened: "What happened today?",
    contentPlaceholder: "Write about your day…",
    tags: "Tags",
    tagsHint: "(comma separated, e.g. travel, family, work)",
    tagsPlaceholder: "travel, family…",
    savedTags: "Saved tags",
    savedTagsHint: "(click to add, × to forget — entries keep their tags)",
    cancel: "Cancel",
    saveEntry: "Save entry",
    updateEntry: "Update entry",
    from: "From",
    to: "To",
    search: "Search",
    searchPlaceholder: "Search phrases…",
    tag: "Tag",
    allTags: "All tags",
    order: "Order",
    newestFirst: "Newest first",
    oldestFirst: "Oldest first",
    clear: "Clear",
    edit: "Edit",
    del: "Delete",
    writeFirst: "Write something first.",
    pickDate: "Pick a date for this entry.",
    saving: "Saving…",
    saved: "Entry saved ✓",
    updated: "Entry updated ✓",
    couldNotSave: "Could not save: ",
    tagsNotRemembered: "Entry saved, but tags could not be remembered: ",
    deleteConfirm: "Delete this entry? This cannot be undone.",
    couldNotDelete: "Could not delete: ",
    forgetConfirm: (tag) => `Forget the tag “${tag}”? Existing entries keep it.`,
    couldNotRemoveTag: "Could not remove tag: ",
    couldNotLoad: "Could not load entries: ",
    emptyFiltered: "No entries match these filters.",
    emptyNone: "No entries yet — head to the Write tab and capture your first day.",
    summary: (n, filtered, tag) =>
      `${n} ${n === 1 ? "entry" : "entries"}${filtered ? " (filtered)" : ""}${tag ? ` — tag “${tag}”` : ""}`,
    addToEntry: "Add to this entry",
    removeFromEntry: "Remove from this entry",
    forgetThisTag: "Forget this tag",
    forgetTagAria: (tag) => "Forget tag " + tag,
    signInFailed: "Sign-in failed: ",
    exportTxt: "Download .txt",
    share: "Share",
    nothingToExport: "No entries to export — adjust the filters first.",
    exportPeriod: "Period",
    exportFrom: "From",
    exportTo: "Until",
    exportTag: "Tag",
    exportSearch: "Search",
    exportFileBase: "diary",
    shareFailed: "Sharing is not supported here — the .txt download works everywhere.",
    locale: "en-GB",
    toggleLabel: "IS",
  },
  is: {
    appName: "Dagbókin mín",
    tagline: "Rólegur staður fyrir dagana þína.",
    loginGithub: "Halda áfram með GitHub",
    loginGoogle: "Halda áfram með Google",
    tabWrite: "Skrifa",
    tabDiary: "Öll dagbókin",
    signOut: "Útskrá",
    todaysEntry: "Færsla dagsins",
    editEntry: "Breyta færslu",
    date: "Dagsetning",
    whatHappened: "Hvað gerðist í dag?",
    contentPlaceholder: "Skrifaðu um daginn þinn…",
    tags: "Merki",
    tagsHint: "(aðskilin með kommum, t.d. ferðalög, fjölskylda, vinna)",
    tagsPlaceholder: "ferðalög, fjölskylda…",
    savedTags: "Vistuð merki",
    savedTagsHint: "(smelltu til að bæta við, × til að gleyma — færslur halda merkjum sínum)",
    cancel: "Hætta við",
    saveEntry: "Vista færslu",
    updateEntry: "Uppfæra færslu",
    from: "Frá",
    to: "Til",
    search: "Leita",
    searchPlaceholder: "Leita að texta…",
    tag: "Merki",
    allTags: "Öll merki",
    order: "Röð",
    newestFirst: "Nýjast fyrst",
    oldestFirst: "Elst fyrst",
    clear: "Hreinsa",
    edit: "Breyta",
    del: "Eyða",
    writeFirst: "Skrifaðu eitthvað fyrst.",
    pickDate: "Veldu dagsetningu fyrir færsluna.",
    saving: "Vista…",
    saved: "Færsla vistuð ✓",
    updated: "Færsla uppfærð ✓",
    couldNotSave: "Ekki tókst að vista: ",
    tagsNotRemembered: "Færslan vistaðist en ekki tókst að muna merkin: ",
    deleteConfirm: "Eyða þessari færslu? Ekki er hægt að afturkalla það.",
    couldNotDelete: "Ekki tókst að eyða: ",
    forgetConfirm: (tag) => `Gleyma merkinu „${tag}“? Færslur sem hafa það halda því.`,
    couldNotRemoveTag: "Ekki tókst að fjarlægja merkið: ",
    couldNotLoad: "Ekki tókst að sækja færslur: ",
    emptyFiltered: "Engar færslur passa við þessar síur.",
    emptyNone: "Engar færslur ennþá — farðu í „Skrifa“ og skráðu fyrsta daginn.",
    summary: (n, filtered, tag) =>
      `${n} ${n % 10 === 1 && n % 100 !== 11 ? "færsla" : "færslur"}${filtered ? " (síað)" : ""}${tag ? ` — merki „${tag}“` : ""}`,
    addToEntry: "Bæta við þessa færslu",
    removeFromEntry: "Fjarlægja úr þessari færslu",
    forgetThisTag: "Gleyma þessu merki",
    forgetTagAria: (tag) => "Gleyma merki " + tag,
    signInFailed: "Innskráning mistókst: ",
    exportTxt: "Sækja .txt",
    share: "Deila",
    nothingToExport: "Engar færslur til að flytja út — breyttu síunum fyrst.",
    exportPeriod: "Tímabil",
    exportFrom: "Frá",
    exportTo: "Til",
    exportTag: "Merki",
    exportSearch: "Leit",
    exportFileBase: "dagbok",
    shareFailed: "Deiling er ekki studd hér — .txt skráin virkar alls staðar.",
    locale: "is-IS",
    toggleLabel: "EN",
  },
};

let lang = localStorage.getItem("mydiary-lang") ||
  ((navigator.language || "").toLowerCase().startsWith("is") ? "is" : "en");

const t = (key, ...args) => {
  const value = I18N[lang][key];
  return typeof value === "function" ? value(...args) : value;
};

function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = t("appName");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  $("lang-toggle").textContent = t("toggleLabel");
  $("lang-toggle-auth").textContent = t("toggleLabel");
  $("write-title").textContent = editingId ? t("editEntry") : t("todaysEntry");
  $("save-btn").textContent = editingId ? t("updateEntry") : t("saveEntry");

  if (currentUser) {
    renderSavedTags();
    refreshTagOptions();
    loadEntries();
  }
}

function toggleLanguage() {
  lang = lang === "is" ? "en" : "is";
  localStorage.setItem("mydiary-lang", lang);
  applyLanguage();
}

const authScreen = $("auth-screen");
const appScreen = $("app-screen");
const loading = $("loading");

let currentUser = null;
let editingId = null; // entry id when editing an existing entry
let savedTags = []; // remembered tags shown as quick-pick chips
let lastView = { entries: [], filters: {} }; // the currently displayed (filtered) diary view

/* ===== Auth ===== */

async function init() {
  const { data: { session } } = await db.auth.getSession();
  applySession(session);

  db.auth.onAuthStateChange((_event, session) => applySession(session));

  $("login-github").addEventListener("click", () => signIn("github"));
  $("login-google").addEventListener("click", () => signIn("google"));
  $("logout-btn").addEventListener("click", () => db.auth.signOut());
  $("lang-toggle").addEventListener("click", toggleLanguage);
  $("lang-toggle-auth").addEventListener("click", toggleLanguage);

  $("tab-write").addEventListener("click", () => showTab("write"));
  $("tab-diary").addEventListener("click", () => showTab("diary"));

  $("save-btn").addEventListener("click", saveEntry);
  $("cancel-edit-btn").addEventListener("click", cancelEdit);
  $("entry-tags").addEventListener("input", () => {
    renderTagPreview();
    renderSavedTags();
  });

  ["filter-from", "filter-to", "filter-tag", "filter-sort"].forEach((id) =>
    $(id).addEventListener("change", loadEntries)
  );
  $("filter-search").addEventListener("input", debounce(loadEntries, 350));
  $("clear-filters").addEventListener("click", clearFilters);
  $("export-btn").addEventListener("click", exportView);
  $("share-btn").addEventListener("click", shareView);

  $("entry-date").value = todayISO();
  applyLanguage();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  }
}

function applySession(session) {
  loading.classList.add("hidden");
  currentUser = session?.user ?? null;

  if (!currentUser) {
    authScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    return;
  }

  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  const meta = currentUser.user_metadata || {};
  $("user-name").textContent = meta.full_name || meta.user_name || currentUser.email || "";
  const avatar = $("user-avatar");
  if (meta.avatar_url) {
    avatar.src = meta.avatar_url;
    avatar.classList.remove("hidden");
  }

  refreshTagOptions();
  loadSavedTags();
  loadEntries();
}

async function signIn(provider) {
  const { error } = await db.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) alert(t("signInFailed") + error.message);
}

/* ===== Tabs ===== */

function showTab(name) {
  $("tab-write").classList.toggle("active", name === "write");
  $("tab-diary").classList.toggle("active", name === "diary");
  $("panel-write").classList.toggle("hidden", name !== "write");
  $("panel-diary").classList.toggle("hidden", name !== "diary");
  if (name === "diary") {
    refreshTagOptions();
    loadEntries();
  }
}

/* ===== Writing ===== */

function parseTags(raw) {
  return [...new Set(
    raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
  )];
}

function renderTagPreview() {
  const tags = parseTags($("entry-tags").value);
  $("tag-preview").innerHTML = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
}

/* ===== Saved tags (remembered across entries) ===== */

async function loadSavedTags() {
  const { data, error } = await db.from("diary_tags").select("tag").order("tag");
  if (error) return;
  savedTags = data.map((r) => r.tag);
  renderSavedTags();
}

function renderSavedTags() {
  $("saved-tags-section").classList.toggle("hidden", !savedTags.length);
  const active = new Set(parseTags($("entry-tags").value));
  const container = $("saved-tags");
  container.replaceChildren();

  for (const tag of savedTags) {
    const wrap = document.createElement("span");
    wrap.className = "saved-tag";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = active.has(tag) ? "tag active" : "tag";
    toggle.textContent = "#" + tag;
    toggle.title = active.has(tag) ? t("removeFromEntry") : t("addToEntry");
    toggle.addEventListener("click", () => toggleSavedTag(tag));

    const forget = document.createElement("button");
    forget.type = "button";
    forget.className = "tag-x";
    forget.textContent = "×";
    forget.title = t("forgetThisTag");
    forget.setAttribute("aria-label", t("forgetTagAria", tag));
    forget.addEventListener("click", () => forgetTag(tag));

    wrap.append(toggle, forget);
    container.append(wrap);
  }
}

function toggleSavedTag(tag) {
  const tags = parseTags($("entry-tags").value);
  const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
  $("entry-tags").value = next.join(", ");
  renderTagPreview();
  renderSavedTags();
}

async function forgetTag(tag) {
  if (!confirm(t("forgetConfirm", tag))) return;
  const { error } = await db.from("diary_tags").delete().eq("tag", tag);
  if (error) {
    alert(t("couldNotRemoveTag") + error.message);
    return;
  }
  savedTags = savedTags.filter((t) => t !== tag);
  renderSavedTags();
}

async function rememberTags(tags) {
  if (!tags.length) return;
  const { error } = await db.from("diary_tags").upsert(
    tags.map((tag) => ({ user_id: currentUser.id, tag })),
    { onConflict: "user_id,tag", ignoreDuplicates: true }
  );
  if (error) {
    const status = $("write-status");
    status.textContent = t("tagsNotRemembered") + error.message;
    status.classList.add("error");
    return;
  }
  loadSavedTags();
}

async function saveEntry() {
  const content = $("entry-content").value.trim();
  const entryDate = $("entry-date").value;
  const status = $("write-status");

  if (!content) {
    status.textContent = t("writeFirst");
    status.classList.add("error");
    return;
  }
  if (!entryDate) {
    status.textContent = t("pickDate");
    status.classList.add("error");
    return;
  }

  status.classList.remove("error");
  status.textContent = t("saving");
  $("save-btn").disabled = true;

  const record = {
    entry_date: entryDate,
    content,
    tags: parseTags($("entry-tags").value),
    updated_at: new Date().toISOString(),
  };

  let error;
  if (editingId) {
    ({ error } = await db.from("diary_entries").update(record).eq("id", editingId));
  } else {
    record.user_id = currentUser.id;
    ({ error } = await db.from("diary_entries").insert(record));
  }

  $("save-btn").disabled = false;

  if (error) {
    status.textContent = t("couldNotSave") + error.message;
    status.classList.add("error");
    return;
  }

  status.textContent = editingId ? t("updated") : t("saved");
  setTimeout(() => { status.textContent = ""; }, 3000);
  rememberTags(record.tags);
  resetWriteForm();
  refreshTagOptions();
}

function resetWriteForm() {
  editingId = null;
  $("write-title").textContent = t("todaysEntry");
  $("entry-date").value = todayISO();
  $("entry-content").value = "";
  $("entry-tags").value = "";
  $("tag-preview").innerHTML = "";
  renderSavedTags();
  $("cancel-edit-btn").classList.add("hidden");
  $("save-btn").textContent = t("saveEntry");
}

function cancelEdit() {
  resetWriteForm();
  showTab("diary");
}

function startEdit(entry) {
  editingId = entry.id;
  $("write-title").textContent = t("editEntry");
  $("entry-date").value = entry.entry_date;
  $("entry-content").value = entry.content;
  $("entry-tags").value = (entry.tags || []).join(", ");
  renderTagPreview();
  renderSavedTags();
  $("cancel-edit-btn").classList.remove("hidden");
  $("save-btn").textContent = t("updateEntry");
  showTab("write");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===== Diary listing ===== */

async function loadEntries() {
  if (!currentUser) return;

  const from = $("filter-from").value;
  const to = $("filter-to").value;
  const search = $("filter-search").value.trim();
  const tag = $("filter-tag").value;
  const ascending = $("filter-sort").value === "asc";

  let query = db.from("diary_entries").select("*");
  if (from) query = query.gte("entry_date", from);
  if (to) query = query.lte("entry_date", to);
  if (search) query = query.ilike("content", "%" + escapeLike(search) + "%");
  if (tag) query = query.contains("tags", [tag]);
  // Within a day, parts always read oldest-first so the day's story flows top to bottom.
  query = query.order("entry_date", { ascending }).order("created_at", { ascending: true });

  const { data, error } = await query;
  const container = $("entries");

  if (error) {
    showEmptyState(container, t("couldNotLoad") + error.message);
    return;
  }

  const filtered = from || to || search || tag;
  lastView = { entries: data, filters: { from, to, search, tag } };
  $("diary-summary").textContent = data.length
    ? t("summary", data.length, !!filtered, tag)
    : "";

  if (!data.length) {
    showEmptyState(container, filtered ? t("emptyFiltered") : t("emptyNone"));
    return;
  }

  const groups = groupByDate(data);

  let html = "";
  let lastMonth = "";
  for (const group of groups) {
    const month = monthLabel(group.date);
    if (month !== lastMonth) {
      html += `<h3 class="month-heading">${escapeHtml(month)}</h3>`;
      lastMonth = month;
    }
    html += renderDateGroup(group, search);
  }
  container.innerHTML = html;

  container.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const entry = data.find((e) => e.id === btn.dataset.edit);
      if (entry) startEdit(entry);
    })
  );
  container.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => deleteEntry(btn.dataset.delete))
  );
  container.querySelectorAll("[data-tag]").forEach((btn) =>
    btn.addEventListener("click", () => {
      $("filter-tag").value = btn.dataset.tag;
      loadEntries();
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
  );
}

/* Group consecutive entries that share the same date (input is already
   sorted by entry_date, so same-date rows are adjacent). */
function groupByDate(entries) {
  const groups = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.entry_date) {
      last.items.push(entry);
    } else {
      groups.push({ date: entry.entry_date, items: [entry] });
    }
  }
  return groups;
}

function showEmptyState(container, message) {
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = message;
  container.replaceChildren(p);
}

function renderDateGroup(group, search) {
  const parts = group.items.map((entry) => {
    const tags = (entry.tags || [])
      .map((t) => `<button class="tag" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`)
      .join("");
    return `
      <div class="entry-part">
        <div class="entry-actions part-actions">
          <button data-edit="${entry.id}">${escapeHtml(t("edit"))}</button>
          <button class="delete" data-delete="${entry.id}">${escapeHtml(t("del"))}</button>
        </div>
        <p class="entry-content">${highlight(entry.content, search)}</p>
        ${tags ? `<div class="tag-row">${tags}</div>` : ""}
      </div>`;
  }).join("");

  return `
    <article class="entry">
      <div class="entry-head">
        <h3 class="entry-date">${escapeHtml(dateLabel(group.date))}</h3>
      </div>
      ${parts}
    </article>`;
}

async function deleteEntry(id) {
  if (!confirm(t("deleteConfirm"))) return;
  const { error } = await db.from("diary_entries").delete().eq("id", id);
  if (error) {
    alert(t("couldNotDelete") + error.message);
    return;
  }
  loadEntries();
  refreshTagOptions();
}

/* ===== Export and share ===== */

function buildExportText() {
  const { entries, filters } = lastView;
  const lines = [t("appName")];

  if (filters.from && filters.to) {
    lines.push(`${t("exportPeriod")}: ${dateLabel(filters.from)} – ${dateLabel(filters.to)}`);
  } else if (filters.from) {
    lines.push(`${t("exportFrom")}: ${dateLabel(filters.from)}`);
  } else if (filters.to) {
    lines.push(`${t("exportTo")}: ${dateLabel(filters.to)}`);
  }
  if (filters.tag) lines.push(`${t("exportTag")}: #${filters.tag}`);
  if (filters.search) lines.push(`${t("exportSearch")}: “${filters.search}”`);
  lines.push(t("summary", entries.length, false, ""));
  lines.push("", "=".repeat(40));

  for (const group of groupByDate(entries)) {
    lines.push("", dateLabel(group.date), "");
    group.items.forEach((entry, i) => {
      if (i > 0) lines.push("", "· · ·", "");
      lines.push(entry.content.trim());
      if ((entry.tags || []).length) {
        lines.push("", entry.tags.map((tag) => "#" + tag).join(" "));
      }
    });
    lines.push("", "-".repeat(40));
  }

  return lines.join("\n") + "\n";
}

function exportFileName() {
  const { filters } = lastView;
  const range = [filters.from, filters.to].filter(Boolean).join("_");
  const parts = [t("exportFileBase"), filters.tag, range || todayISO()];
  return parts.filter(Boolean).join("_").replace(/[^\wæöðþáéíóúý.-]+/gi, "-") + ".txt";
}

function exportView() {
  if (!lastView.entries.length) {
    alert(t("nothingToExport"));
    return;
  }
  const blob = new Blob([buildExportText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName();
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function shareView() {
  if (!lastView.entries.length) {
    alert(t("nothingToExport"));
    return;
  }
  const text = buildExportText();
  const file = new File([text], exportFileName(), { type: "text/plain" });

  try {
    // Native share sheet with the .txt attached (mobile email, WhatsApp, etc.)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: t("appName") });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: t("appName"), text });
      return;
    }
  } catch (err) {
    if (err && err.name === "AbortError") return; // user closed the share sheet
  }

  // Fallback: open an email draft (body capped — mailto URLs have length limits)
  const body = text.length > 1800 ? text.slice(0, 1800) + "\n…" : text;
  window.location.href =
    `mailto:?subject=${encodeURIComponent(t("appName"))}&body=${encodeURIComponent(body)}`;
}

/* ===== Tag filter options ===== */

async function refreshTagOptions() {
  const { data, error } = await db.from("diary_entries").select("tags");
  if (error) return;

  const all = [...new Set(data.flatMap((r) => r.tags || []))].sort();
  const select = $("filter-tag");
  const current = select.value;
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.dataset.i18n = "allTags";
  allOption.textContent = t("allTags");
  select.replaceChildren(allOption, ...all.map((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = "#" + tag;
    return option;
  }));
  if (all.includes(current)) select.value = current;
}

function clearFilters() {
  $("filter-from").value = "";
  $("filter-to").value = "";
  $("filter-search").value = "";
  $("filter-tag").value = "";
  $("filter-sort").value = "desc";
  loadEntries();
}

/* ===== Helpers ===== */

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Icelandic dates are formatted by hand — Intl's is-IS data is missing in
   some browsers and silently falls back to English. */
const IS_DAYS = ["sunnudagur", "mánudagur", "þriðjudagur", "miðvikudagur", "fimmtudagur", "föstudagur", "laugardagur"];
const IS_MONTHS = ["janúar", "febrúar", "mars", "apríl", "maí", "júní", "júlí", "ágúst", "september", "október", "nóvember", "desember"];

function dateLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  if (lang === "is") {
    return `${IS_DAYS[d.getDay()]}, ${d.getDate()}. ${IS_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString(t("locale"), {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function monthLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  if (lang === "is") {
    return `${IS_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString(t("locale"), {
    month: "long", year: "numeric",
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* Escape %, _ and \ so user input is matched literally in ilike patterns. */
function escapeLike(str) {
  return str.replace(/[\\%_]/g, "\\$&");
}

function highlight(text, search) {
  const safe = escapeHtml(text);
  if (!search) return safe;
  const pattern = escapeHtml(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(pattern, "gi"), (m) => `<mark>${m}</mark>`);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

init();
