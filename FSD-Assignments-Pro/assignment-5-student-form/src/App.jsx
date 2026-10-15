import { useState } from "react";
import "./App.css";

const COURSES = ["MCA", "MBA", "BCA", "BTech"];
const EMPTY = { name: "", email: "", age: "", course: "" };

// Returns a hint for one field (empty string = looks good). Only used for friendly feedback.
function check(field, value) {
  switch (field) {
    case "name":   return value.trim().length < 2 ? "Enter at least 2 characters" : "";
    case "email":  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? "" : "Enter a valid email address";
    case "age":    return value >= 15 && value <= 80 ? "" : "Age should be between 15 and 80";
    case "course": return value ? "" : "Please pick a course";
    default:       return "";
  }
}

function App() {
  // ONE state object holds every input → each input is "controlled" by React.
  const [formData, setFormData] = useState(EMPTY);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });   // update only the field that changed
  };
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });
  const handleReset = () => { setFormData(EMPTY); setTouched({}); };

  const fields = Object.keys(EMPTY);
  const filled = fields.filter((f) => formData[f] !== "" && !check(f, formData[f])).length;
  const percent = Math.round((filled / fields.length) * 100);
  const initials = formData.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const hint = (f) => (touched[f] && formData[f] !== "" ? check(f, formData[f]) : touched[f] ? "This field is required" : "");

  return (
    <div className="page">
      <header className="top">
        <span className="tag">React · Controlled Components</span>
        <h1>Student <span>Registration</span></h1>
        <p>Type in the form — your details appear live in the panel below.</p>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>Your details</h2>
          <div className="progress" aria-label={`Form ${percent}% complete`}>
            <div style={{ width: `${percent}%` }} />
            <span>{percent}%</span>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="row">
            <label>
              Name
              <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur}
                placeholder="Enter your name" className={hint("name") ? "bad" : ""} />
              <small>{hint("name")}</small>
            </label>
            <label>
              Email
              <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur}
                placeholder="Enter your email" className={hint("email") ? "bad" : ""} />
              <small>{hint("email")}</small>
            </label>
          </div>
          <div className="row">
            <label>
              Age
              <input type="number" name="age" value={formData.age} onChange={handleChange} onBlur={handleBlur}
                placeholder="Enter your age" className={hint("age") ? "bad" : ""} />
              <small>{hint("age")}</small>
            </label>
            <label>
              Course
              <select name="course" value={formData.course} onChange={handleChange} onBlur={handleBlur}
                className={hint("course") ? "bad" : ""}>
                <option value="">Select Course</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <small>{hint("course")}</small>
            </label>
          </div>
          <button type="button" className="reset" onClick={handleReset}>Clear form</button>
        </form>
      </section>

      {/* Real-time display of the entered data, directly BELOW the form */}
      <section className="panel live" aria-live="polite">
        <div className="panel-head">
          <h2>Entered details <i className="pulse" /></h2>
          <span className="badge">LIVE</span>
        </div>

        <div className="idcard">
          <div className="idavatar">{initials || "?"}</div>
          <dl>
            <div><dt>Name</dt><dd className={formData.name ? "" : "empty"}>{formData.name || "Not entered"}</dd></div>
            <div><dt>Email</dt><dd className={formData.email ? "" : "empty"}>{formData.email || "Not entered"}</dd></div>
            <div><dt>Age</dt><dd className={formData.age ? "" : "empty"}>{formData.age || "Not entered"}</dd></div>
            <div><dt>Course</dt><dd className={formData.course ? "" : "empty"}>{formData.course || "Not selected"}</dd></div>
          </dl>
        </div>

        <p className="state-label">Current React state</p>
        <pre className="state">{JSON.stringify(formData, null, 2)}</pre>
      </section>
    </div>
  );
}

export default App;
