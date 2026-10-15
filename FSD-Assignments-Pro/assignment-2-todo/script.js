(() => {
  "use strict";

  const STORE_KEY = "taskboard.v1";
  const $ = (s) => document.querySelector(s);
  const els = {
    form: $("#addForm"), input: $("#taskInput"), priority: $("#priority"), due: $("#dueDate"), msg: $("#formMsg"),
    list: $("#taskList"), empty: $("#empty"), search: $("#search"), bar: $("#bar"),
    done: $("#doneCount"), total: $("#totalCount"), left: $("#leftCount"),
    toast: $("#toast"), toastMsg: $("#toastMsg"), undo: $("#undoBtn"),
  };

  const state = { tasks: load(), filter: "all", query: "", editingId: null, trash: null };

  // ---------- storage ----------
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
  }
  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.tasks)); } catch { /* ignore */ }
  }

  // ---------- tiny DOM helper (uses textContent, so user text can never inject HTML) ----------
  function h(tag, props = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    kids.flat().forEach((c) => c && node.append(c));
    return node;
  }

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const todayISO = () => new Date().toISOString().slice(0, 10);

  // ---------- actions ----------
  function addTask(text) {
    state.tasks.unshift({ id: newId(), text, done: false, priority: els.priority.value, due: els.due.value || null });
    persist(); render();
  }
  const find = (id) => state.tasks.find((t) => t.id === id);

  // Mark complete: update data, then flip the class on the existing <li> (DOM method).
  function toggle(id) {
    const t = find(id); if (!t) return;
    t.done = !t.done; persist();
    const li = els.list.querySelector(`[data-id="${id}"]`);
    if (state.filter !== "all" || !li) return render();   // item may leave the current filtered view
    li.classList.toggle("is-done", t.done);
    const check = li.querySelector(".check");
    check.textContent = t.done ? "✓" : "";
    check.setAttribute("aria-label", t.done ? "Mark as not done" : "Mark as done");
    updateStats();
  }

  // Delete dynamically: remove the <li> from the page (DOM method) and keep it for Undo.
  function remove(id) {
    const index = state.tasks.findIndex((t) => t.id === id);
    if (index < 0) return;
    const [task] = state.tasks.splice(index, 1);
    state.trash = { task, index };
    persist();
    els.list.querySelector(`[data-id="${id}"]`)?.remove();
    updateStats(); showToast("Task deleted");
  }

  function undoDelete() {
    if (!state.trash) return;
    state.tasks.splice(state.trash.index, 0, state.trash.task);
    state.trash = null; persist(); render(); hideToast();
  }

  function saveEdit(id, value) {
    const t = find(id), text = value.trim();
    if (t && text) t.text = text;
    state.editingId = null; persist(); render();
  }

  // ---------- rendering ----------
  function visibleTasks() {
    const q = state.query.toLowerCase();
    return state.tasks.filter((t) => {
      const byFilter = state.filter === "all" || (state.filter === "done" ? t.done : !t.done);
      return byFilter && t.text.toLowerCase().includes(q);
    });
  }

  function buildItem(t) {
    const li = h("li", { class: "item" + (t.done ? " is-done" : ""), "data-id": t.id });
    const check = h("button", { class: "check", type: "button", "data-act": "toggle", "aria-label": t.done ? "Mark as not done" : "Mark as done", text: t.done ? "✓" : "" });

    let main;
    if (state.editingId === t.id) {
      main = h("input", { class: "edit-input", type: "text", maxlength: "120", value: t.text, "data-edit": t.id });
    } else {
      main = h("span", { class: "text", "data-act": "edit", title: "Double-click to edit", text: t.text });
    }

    const chips = h("div", { class: "chips" },
      h("span", { class: `chip ${t.priority}`, text: { low: "LOW", med: "MED", high: "HIGH" }[t.priority] }),
      t.due && h("span", { class: "chip" + (!t.done && t.due < todayISO() ? " late" : ""),
        text: (!t.done && t.due < todayISO() ? "OVERDUE · " : "DUE ") + t.due }));

    const acts = h("div", { class: "acts" },
      h("button", { class: "icon", type: "button", "data-act": "edit-btn", "aria-label": "Edit task", text: "✎" }),
      h("button", { class: "icon del", type: "button", "data-act": "delete", "aria-label": "Delete task", text: "✕" }));

    li.append(check, h("div", { class: "body" }, main, chips), acts);
    return li;
  }

  function updateStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    els.done.textContent = done;
    els.total.textContent = total;
    els.bar.style.width = total ? `${(done / total) * 100}%` : "0";
    const left = total - done;
    els.left.textContent = `${left} item${left === 1 ? "" : "s"} left`;
    const shown = els.list.children.length;
    els.empty.hidden = shown > 0;
    if (!shown) els.empty.textContent = total === 0 ? "Nothing here yet — add your first task ☝" : "No tasks match this view.";
  }

  function render() {
    const shown = visibleTasks();
    els.list.replaceChildren(...shown.map(buildItem));

    updateStats();

    const editor = els.list.querySelector(".edit-input");
    if (editor) { editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length); }
  }

  // ---------- toast ----------
  function showToast(message) {
    els.toastMsg.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(hideToast, 5000);
  }
  function hideToast() { els.toast.classList.remove("show"); }

  // ---------- events ----------
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = els.input.value.trim();
    if (!text) {
      els.msg.textContent = "Type a task first!";
      els.form.classList.remove("shake"); void els.form.offsetWidth; els.form.classList.add("shake");
      els.input.focus();
      return;
    }
    els.msg.textContent = "";
    addTask(text);
    els.input.value = ""; els.due.value = "";
    els.input.focus();
  });
  els.input.addEventListener("input", () => { els.msg.textContent = ""; });

  els.list.addEventListener("click", (e) => {
    const target = e.target.closest("[data-act]");
    if (!target) return;
    const id = target.closest(".item").dataset.id;
    const act = target.dataset.act;
    if (act === "toggle") toggle(id);
    else if (act === "delete") remove(id);
    else if (act === "edit-btn") { state.editingId = id; render(); }
  });
  els.list.addEventListener("dblclick", (e) => {
    const text = e.target.closest(".text");
    if (text) { state.editingId = text.closest(".item").dataset.id; render(); }
  });
  els.list.addEventListener("keydown", (e) => {
    if (!e.target.matches(".edit-input")) return;
    if (e.key === "Enter") saveEdit(e.target.dataset.edit, e.target.value);
    if (e.key === "Escape") { state.editingId = null; render(); }
  });
  els.list.addEventListener("focusout", (e) => {
    if (e.target.matches(".edit-input") && state.editingId) saveEdit(e.target.dataset.edit, e.target.value);
  });

  document.querySelector(".tabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-on", t === tab));
    state.filter = tab.dataset.filter; render();
  });
  els.search.addEventListener("input", () => { state.query = els.search.value.trim(); render(); });
  $("#clearDone").addEventListener("click", () => {
    state.tasks = state.tasks.filter((t) => !t.done); persist(); render();
  });
  els.undo.addEventListener("click", undoDelete);

  render();
})();
