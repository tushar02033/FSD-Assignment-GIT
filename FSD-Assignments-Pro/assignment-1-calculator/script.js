(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const numA = $("#numA"), numB = $("#numB");
  const lcd = $("#lcd"), exprEl = $("#expr"), outEl = $("#out");
  const tapeEl = $("#tape"), toastEl = $("#toast");
  const STORE_KEY = "calc2.tape";

  // Display symbols for each operator (used on the LCD and the paper tape).
  const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  // One small function per arithmetic operation.
  function add(a, b)      { return a + b; }
  function subtract(a, b) { return a - b; }
  function multiply(a, b) { return a * b; }
  function divide(a, b) {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  }

  // Chooses the right function with a switch statement.
  function performOperation(a, b, operator) {
    switch (operator) {
      case "+":
        return add(a, b);
      case "-":
        return subtract(a, b);
      case "*":
        return multiply(a, b);
      case "/":
        return divide(a, b);
      default:
        throw new Error("Invalid operator");
    }
  }

  let currentOp = "+";
  let tape = loadTape();

  // Trim floating-point noise (0.1 + 0.2 -> 0.3) and handle huge/tiny values.
  function format(n) {
    const r = Number(n.toPrecision(12));
    const abs = Math.abs(r);
    if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) return r.toExponential(6);
    return String(r);
  }

  function loadTape() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch { return []; }
  }
  function saveTape() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(tape)); } catch { /* storage unavailable */ }
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove("show"), 1600);
  }

  function setOperator(op) {
    currentOp = op;
    document.querySelectorAll(".op").forEach((btn) => {
      const on = btn.dataset.op === op;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-checked", String(on));
    });
    previewExpression();
  }

  function previewExpression() {
    const a = numA.value === "" ? "0" : numA.value;
    const b = numB.value === "" ? "0" : numB.value;
    exprEl.textContent = `${a} ${SYMBOLS[currentOp]} ${b}`;
  }

  function showError(message, badInputs = []) {
    lcd.classList.remove("error");
    void lcd.offsetWidth;                // restart the shake animation
    lcd.classList.add("error");
    outEl.textContent = message;
    badInputs.forEach((i) => i.classList.add("bad"));
  }

  function calculate() {
    [numA, numB].forEach((i) => i.classList.remove("bad"));
    lcd.classList.remove("error");

    const a = parseFloat(numA.value);
    const b = parseFloat(numB.value);

    if (Number.isNaN(a) || Number.isNaN(b)) {
      const missing = [numA, numB].filter((i) => i.value.trim() === "");
      showError("Please enter both numbers", missing);
      (missing[0] || numA).focus();
      return;
    }

    try {
      const result = format(performOperation(a, b, currentOp));
      previewExpression();
      outEl.textContent = result;
      tape.unshift({ a, b, op: currentOp, result });
      tape = tape.slice(0, 6);
      saveTape();
      renderTape();
    } catch (err) {
      showError(err.message, currentOp === "/" ? [numB] : []);
    }
  }

  function reset() {
    numA.value = numB.value = "";
    [numA, numB].forEach((i) => i.classList.remove("bad"));
    lcd.classList.remove("error");
    setOperator("+");
    outEl.textContent = "0";
    numA.focus();
  }

  function renderTape() {
    tapeEl.replaceChildren();
    if (!tape.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No calculations yet.";
      tapeEl.append(li);
      return;
    }
    tape.forEach((row, index) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.index = index;
      btn.title = "Click to reuse these values";
      const left = document.createElement("span");
      left.textContent = `${row.a} ${SYMBOLS[row.op]} ${row.b}`;
      const right = document.createElement("b");
      right.textContent = `= ${row.result}`;
      btn.append(left, right);
      li.append(btn);
      tapeEl.append(li);
    });
  }

  // ---- events ----
  document.querySelector(".ops").addEventListener("click", (e) => {
    const btn = e.target.closest(".op");
    if (btn) setOperator(btn.dataset.op);
  });
  $("#calc").addEventListener("click", calculate);
  $("#reset").addEventListener("click", reset);
  $("#swap").addEventListener("click", () => {
    [numA.value, numB.value] = [numB.value, numA.value];
    previewExpression();
  });
  $("#clearTape").addEventListener("click", () => { tape = []; saveTape(); renderTape(); });
  [numA, numB].forEach((i) => i.addEventListener("input", () => { i.classList.remove("bad"); previewExpression(); }));

  tapeEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-index]");
    if (!btn) return;
    const row = tape[Number(btn.dataset.index)];
    numA.value = row.a; numB.value = row.b;
    setOperator(row.op);
  });

  outEl.addEventListener("click", async () => {
    if (lcd.classList.contains("error")) return;
    try { await navigator.clipboard.writeText(outEl.textContent); toast("Result copied"); }
    catch { toast("Copy not available"); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); calculate(); }
    else if (e.key === "Escape") reset();
  });

  renderTape();
  previewExpression();
})();
