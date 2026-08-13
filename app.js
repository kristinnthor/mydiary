/* My Diary — a personal web diary backed by Supabase. */

const SUPABASE_URL = "https://ikrborprotbvygphjphl.supabase.co";
const SUPABASE_KEY = "sb_publishable_hznZZS64hstnR49UiG5btg_b0330tiY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);

const authScreen = $("auth-screen");
const appScreen = $("app-screen");
const loading = $("loading");

let currentUser = null;
let editingId = null; // entry id when editing an existing entry
let savedTags = []; // remembered tags shown as quick-pick chips

/* ===== Auth ===== */

async function init() {
  const { data: { session } } = await db.auth.getSession();
  applySession(session);

  db.auth.onAuthStateChange((_event, session) => applySession(session));

  $("login-github").addEventListener("click", () => signIn("github"));
  $("login-google").addEventListener("click", () => signIn("google"));
  $("logout-btn").addEventListener("click", () => db.auth.signOut());

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

  $("entry-date").value = todayISO();
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
  if (error) alert("Sign-in failed: " + error.message);
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
    toggle.title = (active.has(tag) ? "Remove from" : "Add to") + " this entry";
    toggle.addEventListener("click", () => toggleSavedTag(tag));

    const forget = document.createElement("button");
    forget.type = "button";
    forget.className = "tag-x";
    forget.textContent = "×";
    forget.title = "Forget this tag";
    forget.setAttribute("aria-label", "Forget tag " + tag);
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
  if (!confirm(`Forget the tag “${tag}”? Existing entries keep it.`)) return;
  const { error } = await db.from("diary_tags").delete().eq("tag", tag);
  if (error) {
    alert("Could not remove tag: " + error.message);
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
    status.textContent = "Entry saved, but tags could not be remembered: " + error.message;
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
    status.textContent = "Write something first.";
    status.classList.add("error");
    return;
  }
  if (!entryDate) {
    status.textContent = "Pick a date for this entry.";
    status.classList.add("error");
    return;
  }

  status.classList.remove("error");
  status.textContent = "Saving…";
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
    status.textContent = "Could not save: " + error.message;
    status.classList.add("error");
    return;
  }

  status.textContent = editingId ? "Entry updated ✓" : "Entry saved ✓";
  setTimeout(() => { status.textContent = ""; }, 3000);
  rememberTags(record.tags);
  resetWriteForm();
  refreshTagOptions();
}

function resetWriteForm() {
  editingId = null;
  $("write-title").textContent = "Today's entry";
  $("entry-date").value = todayISO();
  $("entry-content").value = "";
  $("entry-tags").value = "";
  $("tag-preview").innerHTML = "";
  renderSavedTags();
  $("cancel-edit-btn").classList.add("hidden");
  $("save-btn").textContent = "Save entry";
}

function cancelEdit() {
  resetWriteForm();
  showTab("diary");
}

function startEdit(entry) {
  editingId = entry.id;
  $("write-title").textContent = "Edit entry";
  $("entry-date").value = entry.entry_date;
  $("entry-content").value = entry.content;
  $("entry-tags").value = (entry.tags || []).join(", ");
  renderTagPreview();
  renderSavedTags();
  $("cancel-edit-btn").classList.remove("hidden");
  $("save-btn").textContent = "Update entry";
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
    container.innerHTML = `<p class="empty-state">Could not load entries: ${escapeHtml(error.message)}</p>`;
    return;
  }

  const filtered = from || to || search || tag;
  $("diary-summary").textContent = data.length
    ? `${data.length} ${data.length === 1 ? "entry" : "entries"}${filtered ? " (filtered)" : ""}${tag ? ` — tag “${tag}”` : ""}`
    : "";

  if (!data.length) {
    container.innerHTML = `<p class="empty-state">${filtered
      ? "No entries match these filters."
      : "No entries yet — head to the Write tab and capture your first day."}</p>`;
    return;
  }

  // Group consecutive entries that share the same date into one card
  const groups = [];
  for (const entry of data) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.entry_date) {
      last.items.push(entry);
    } else {
      groups.push({ date: entry.entry_date, items: [entry] });
    }
  }

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

function renderDateGroup(group, search) {
  const parts = group.items.map((entry) => {
    const tags = (entry.tags || [])
      .map((t) => `<button class="tag" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`)
      .join("");
    return `
      <div class="entry-part">
        <div class="entry-actions part-actions">
          <button data-edit="${entry.id}">Edit</button>
          <button class="delete" data-delete="${entry.id}">Delete</button>
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
  if (!confirm("Delete this entry? This cannot be undone.")) return;
  const { error } = await db.from("diary_entries").delete().eq("id", id);
  if (error) {
    alert("Could not delete: " + error.message);
    return;
  }
  loadEntries();
  refreshTagOptions();
}

/* ===== Tag filter options ===== */

async function refreshTagOptions() {
  const { data, error } = await db.from("diary_entries").select("tags");
  if (error) return;

  const all = [...new Set(data.flatMap((r) => r.tags || []))].sort();
  const select = $("filter-tag");
  const current = select.value;
  select.innerHTML =
    '<option value="">All tags</option>' +
    all.map((t) => `<option value="${escapeHtml(t)}">#${escapeHtml(t)}</option>`).join("");
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

function dateLabel(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function monthLabel(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
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
