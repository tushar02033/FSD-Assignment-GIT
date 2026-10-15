import { useEffect, useState } from "react";
import "./App.css";

const STEPS = [1, 5, 10];
const RING = 2 * Math.PI * 120;       // circumference of the progress ring (r = 120)

function App() {
  // ---- useState hooks ----
  const [count, setCount] = useState(0);       // the counter value
  const [step, setStep] = useState(1);         // how much each click changes the value
  const [log, setLog] = useState([]);          // last few actions

  const addLog = (label, value) =>
    setLog((prev) => [{ id: crypto.randomUUID(), label, value }, ...prev].slice(0, 5));

  const increment = () => { const v = count + step; setCount(v); addLog(`+${step}`, v); };
  const decrement = () => { const v = count - step; setCount(v); addLog(`−${step}`, v); };
  const reset = () => { setCount(0); addLog("Reset", 0); };

  // Keyboard shortcuts: ↑ / + increment, ↓ / - decrement, R reset
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowUp" || e.key === "+") increment();
      else if (e.key === "ArrowDown" || e.key === "-") decrement();
      else if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // The ring fills towards the next multiple of 10.
  const progress = (Math.abs(count) % 10) / 10;
  const mood = count > 0 ? "positive" : count < 0 ? "negative" : "zero";
  const message = { positive: "On the up 🚀", negative: "Below zero ❄️", zero: "Perfectly balanced" }[mood];

  return (
    <main className={`stage ${mood}`}>
      <div className="blob b1" /><div className="blob b2" />

      <section className="card">
        <p className="kicker">React · useState</p>
        <h1>Counter Application</h1>

        <div className="dial">
          <svg viewBox="0 0 280 280" aria-hidden="true">
            <circle className="track" cx="140" cy="140" r="120" />
            <circle className="bar" cx="140" cy="140" r="120"
              strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} />
          </svg>
          <div className="readout" aria-live="polite">
            <output key={count} className="num">{count}</output>
            <span>{message}</span>
          </div>
        </div>

        <div className="buttons">
          <button className="btn dec" onClick={decrement}>Decrement −</button>
          <button className="btn inc" onClick={increment}>Increment +</button>
          <button className="btn rst" onClick={reset}>Reset</button>
        </div>

        <div className="step">
          <span>Step size</span>
          {STEPS.map((s) => (
            <button key={s} className={s === step ? "pill on" : "pill"} onClick={() => setStep(s)}>{s}</button>
          ))}
        </div>

        <div className="log">
          <h2>Recent activity</h2>
          {log.length === 0 ? <p className="none">No activity yet — press a button.</p> : (
            <ul>{log.map((l) => <li key={l.id}><b>{l.label}</b><span>→ {l.value}</span></li>)}</ul>
          )}
        </div>
        <p className="keys"><kbd>↑</kbd> add · <kbd>↓</kbd> subtract · <kbd>R</kbd> reset</p>
      </section>
    </main>
  );
}

export default App;
