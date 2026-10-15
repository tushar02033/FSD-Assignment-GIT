# FSD Lab Assignments

Six assignments, each built exactly to its lab question and each with its own design.

| # | Question (from the lab report) | Stack | Folder |
|---|---|---|---|
| 1 | Calculator using JavaScript functions (+ − × ÷) with `switch` / if-else | HTML · CSS · JS | `assignment-1-calculator` |
| 2 | DOM-based to-do list: add, mark completed, delete dynamically | HTML · CSS · JS | `assignment-2-todo` |
| 3 | Registration form (name, email, phone, password) with JS validation + error messages | HTML · CSS · JS | `assignment-3-registration` |
| 4 | React profile card component; props: name, image URL, short description | React + Vite | `assignment-4-profile-cards` |
| 5 | Controlled React form that shows entered data in real time below the form | React + Vite | `assignment-5-student-form` |
| 6 | React counter (increment, decrement, reset) using `useState` | React + Vite | `assignment-6-counter` |

## Run it

**Assignments 1–3** — just open `assignment-N-…/index.html` in a browser.

**Assignments 4–6** (needs Node 18+):
```bash
cd assignment-4-profile-cards
npm install
npm run dev        # development server
npm run build      # production build → dist/
```

**Everything at once** (hub page + all six apps):
```bash
bash build-all.sh
npx serve site
```

## Deploy
Push to GitHub (`main` branch) and enable **Settings → Pages → Source: GitHub Actions**.
`.github/workflows/deploy.yml` builds and publishes the hub with all six assignments.

## Personalise
Edit `OWNER` at the top of `hub.js` to put your name on the hub page.
