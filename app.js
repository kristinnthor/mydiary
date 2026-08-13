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
  $("entry-tags").addEventListener("input", renderTagPreview);

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
  query = query.order("entry_date", { ascending }).order("created_at", { ascending });

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

  let html = "";
  let lastMonth = "";
  for (const entry of data) {
    const month = monthLabel(entry.entry_date);
    if (month !== lastMonth) {
      html += `<h3 class="month-heading">${escapeHtml(month)}</h3>`;
      lastMonth = month;
    }
    html += renderEntry(entry, search);
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

function renderEntry(entry, search) {
  const tags = (entry.tags || [])
    .map((t) => `<button class="tag" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`)
    .join("");
  return `
    <article class="entry">
      <div class="entry-head">
        <h3 class="entry-date">${escapeHtml(dateLabel(entry.entry_date))}</h3>
        <div class="entry-actions">
          <button data-edit="${entry.id}">Edit</button>
          <button class="delete" data-delete="${entry.id}">Delete</button>
        </div>
      </div>
      <p class="entry-content">${highlight(entry.content, search)}</p>
      ${tags ? `<div class="tag-row">${tags}</div>` : ""}
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
