// ✏️ Put your own name here (shown in the top-right of the page):
const OWNER = "Full Stack Development";

const ASSIGNMENTS = [
  { n: "01", type: "js", color: "#ff7a1a", title: "JavaScript Calculator", href: "assignment-1-calculator/",
    task: "Calculator with JavaScript functions using switch / if-else for + − × ÷.",
    features: ["switch statement", "Paper tape", "Keyboard keys", "Copy result"] },
  { n: "02", type: "js", color: "#ffd23f", title: "DOM To-Do List", href: "assignment-2-todo/",
    task: "Add tasks, mark them completed and delete them dynamically with DOM methods.",
    features: ["Priorities & due dates", "Inline edit", "Undo delete", "Saved locally"] },
  { n: "03", type: "js", color: "#2dd4bf", title: "Form Validation", href: "assignment-3-registration/",
    task: "Registration form (name, email, phone, password) validated with JavaScript.",
    features: ["Live validation", "Strength meter", "Show / hide password", "Success screen"] },
  { n: "04", type: "react", color: "#818cf8", title: "Profile Card · Props", href: "assignment-4-profile-cards/",
    task: "React component that receives name, image URL and short description as props.",
    features: ["Reusable component", "Search & filter", "Follow toggle", "Image fallback"] },
  { n: "05", type: "react", color: "#22d3ee", title: "Controlled Form", href: "assignment-5-student-form/",
    task: "Controlled React form that shows the entered data in real time below it.",
    features: ["Single state object", "Live details card", "Field hints", "Progress bar"] },
  { n: "06", type: "react", color: "#fb7185", title: "Counter · useState", href: "assignment-6-counter/",
    task: "Counter with increment, decrement and reset buttons using the useState hook.",
    features: ["Step size", "Progress ring", "Activity log", "Shortcuts"] },
];

const grid = document.getElementById("grid");
const none = document.getElementById("none");
const search = document.getElementById("q");
let filter = "all";

document.getElementById("owner").textContent = OWNER;

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function card(a, i) {
  const link = el("a", "card");
  link.href = a.href;
  link.style.setProperty("--c", a.color);
  link.style.animationDelay = `${i * 60}ms`;
  link.addEventListener("pointermove", (e) => {
    const r = link.getBoundingClientRect();
    link.style.setProperty("--x", `${e.clientX - r.left}px`);
    link.style.setProperty("--y", `${e.clientY - r.top}px`);
  });

  const top = el("div", "top");
  top.append(el("span", "num", a.n), el("span", "tag", a.type === "js" ? "HTML · CSS · JS" : "React + Vite"));
  const feats = el("div", "feat");
  a.features.forEach((f) => feats.append(el("span", "", f)));
  const go = el("div", "go");
  go.append(el("span", "", "Open assignment"), el("i", "", "→"));

  link.append(top, el("h2", "", a.title), el("p", "task", a.task), feats, go);
  return link;
}

function render() {
  const q = search.value.trim().toLowerCase();
  const shown = ASSIGNMENTS.filter((a) =>
    (filter === "all" || a.type === filter) &&
    [a.title, a.task, ...a.features].join(" ").toLowerCase().includes(q));
  grid.replaceChildren(...shown.map(card));
  none.hidden = shown.length > 0;
}

document.querySelector(".filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".f");
  if (!btn) return;
  document.querySelectorAll(".f").forEach((b) => b.classList.toggle("on", b === btn));
  filter = btn.dataset.f;
  render();
});
search.addEventListener("input", render);
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  if (e.key === "Escape") { search.value = ""; search.blur(); render(); }
});

render();
