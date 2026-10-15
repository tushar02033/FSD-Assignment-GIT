import { useMemo, useState } from "react";
import ProfileCard from "./components/ProfileCard";
import { PROFILES } from "./data/profiles";

const ROLES = ["All", ...new Set(PROFILES.map((p) => p.role))];

function App() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROFILES.filter((p) => {
      const matchesRole = role === "All" || p.role === role;
      const haystack = [p.name, p.title, p.location, ...p.skills].join(" ").toLowerCase();
      return matchesRole && haystack.includes(q);
    });
  }, [query, role]);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">React · Props &amp; Components</p>
        <h1>Meet the <em>team.</em></h1>
        <p className="lead">One reusable <code>ProfileCard</code> component. <code>name</code>, <code>image</code> and <code>description</code> are passed in as props.</p>

        <div className="controls">
          <input
            type="search"
            placeholder="Search by name, skill or city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search profiles"
          />
          <div className="chips">
            {ROLES.map((r) => (
              <button key={r} className={r === role ? "chip on" : "chip"} onClick={() => setRole(r)}>{r}</button>
            ))}
          </div>
        </div>
        <p className="count">{visible.length} of {PROFILES.length} profiles</p>
      </header>

      {visible.length ? (
        <main className="grid">
          {visible.map((p) => <ProfileCard key={p.id} {...p} />)}
        </main>
      ) : (
        <p className="none">No profiles match “{query}”. Try another keyword.</p>
      )}
    </div>
  );
}

export default App;
