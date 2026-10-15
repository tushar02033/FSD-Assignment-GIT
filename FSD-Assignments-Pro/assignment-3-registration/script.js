(() => {
  "use strict";

  const form = document.getElementById("registrationForm");
  const success = document.getElementById("success");
  const $field = (name) => form.querySelector(`[data-field="${name}"]`);
  const input = (name) => form.elements[name];

  // Password requirements shown as live chips.
  const PASSWORD_RULES = {
    length:  (v) => v.length >= 8,
    lower:   (v) => /[a-z]/.test(v),
    upper:   (v) => /[A-Z]/.test(v),
    digit:   (v) => /\d/.test(v),
    special: (v) => /[@$!%*?&]/.test(v),
  };

  // One validator per field: returns an error string, or "" when the value is fine.
  const validators = {
    name(v) {
      if (!v) return "Full name is required";
      if (v.length < 2) return "Name must be at least 2 characters";
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return "Use letters, spaces, dots, apostrophes or hyphens only";
      return "";
    },
    email(v) {
      if (!v) return "Email address is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address";
      return "";
    },
    phone(v) {
      if (!v) return "Mobile number is required";
      if (!/^[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit mobile number starting with 6–9";
      return "";
    },
    password(v) {
      if (!v) return "Password is required";
      const failed = Object.values(PASSWORD_RULES).some((rule) => !rule(v));
      return failed ? "Password doesn't meet all the requirements" : "";
    },
    confirm(v) {
      if (!v) return "Please confirm your password";
      if (v !== input("password").value) return "Passwords do not match";
      return "";
    },
    terms() {
      return input("terms").checked ? "" : "You must accept the terms to continue";
    },
  };

  const touched = new Set();

  function valueOf(name) {
    const el = input(name);
    return el.type === "checkbox" ? el.checked : (name === "password" || name === "confirm" ? el.value : el.value.trim());
  }

  function validateField(name, { show = true } = {}) {
    const error = validators[name](valueOf(name));
    if (show) {
      const wrap = $field(name);
      wrap.classList.toggle("invalid", Boolean(error));
      wrap.classList.toggle("valid", !error && valueOf(name) !== false);
      wrap.querySelector(".msg").textContent = error;
      const el = input(name);
      el.setAttribute("aria-invalid", String(Boolean(error)));
    }
    return error;
  }

  function updateStrength() {
    const value = input("password").value;
    let score = 0;
    document.querySelectorAll("#rules li").forEach((li) => {
      const passed = PASSWORD_RULES[li.dataset.rule](value);
      li.classList.toggle("pass", passed);
      if (passed) score++;
    });
    // 5 rules → map to a 0–4 meter; short passwords can't reach "Strong".
    let level = value ? Math.max(1, score - 1) : 0;
    if (value.length < 8) level = Math.min(level, 2);
    const meter = form.querySelector(".strength");
    meter.dataset.score = level;
    document.getElementById("strengthLabel").textContent =
      ["Too weak", "Weak", "Fair", "Good", "Strong"][level];
  }

  // Live feedback: validate once a field has been touched.
  ["name", "email", "phone", "password", "confirm"].forEach((name) => {
    const el = input(name);
    el.addEventListener("blur", () => { touched.add(name); validateField(name); });
    el.addEventListener("input", () => {
      if (name === "phone") el.value = el.value.replace(/\D/g, "").slice(0, 10);
      if (name === "password") {
        updateStrength();
        if (touched.has("confirm")) validateField("confirm");
      }
      if (touched.has(name)) validateField(name);
    });
  });
  input("terms").addEventListener("change", () => validateField("terms"));

  // Show / hide password buttons.
  form.addEventListener("click", (e) => {
    const btn = e.target.closest(".eye");
    if (!btn) return;
    const target = input(btn.dataset.target);
    const reveal = target.type === "password";
    target.type = reveal ? "text" : "password";
    btn.textContent = reveal ? "Hide" : "Show";
    btn.setAttribute("aria-label", `${reveal ? "Hide" : "Show"} ${btn.dataset.target === "confirm" ? "confirmation" : "password"}`);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const names = Object.keys(validators);
    names.forEach((n) => touched.add(n));
    const errors = names.filter((n) => validateField(n));

    if (errors.length) {
      form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
      input(errors[0]).focus();
      return;
    }

    // Success — note: we never store or display the password.
    const ref = "ORB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const email = valueOf("email");
    const [user, domain] = email.split("@");
    document.getElementById("sName").textContent = valueOf("name").split(" ")[0];
    document.getElementById("sEmail").textContent = `${user[0]}${"•".repeat(Math.max(user.length - 1, 2))}@${domain}`;
    document.getElementById("sPhone").textContent = `+91 ${"•".repeat(6)}${valueOf("phone").slice(-4)}`;
    document.getElementById("sRef").textContent = ref;
    form.hidden = true;
    success.hidden = false;
  });

  document.getElementById("again").addEventListener("click", () => {
    form.reset();
    touched.clear();
    form.querySelectorAll(".field").forEach((f) => { f.classList.remove("valid", "invalid"); const m = f.querySelector(".msg"); if (m) m.textContent = ""; });
    form.querySelectorAll(".eye").forEach((b) => { b.textContent = "Show"; input(b.dataset.target).type = "password"; });
    updateStrength();
    success.hidden = true;
    form.hidden = false;
    input("name").focus();
  });

  updateStrength();
})();
