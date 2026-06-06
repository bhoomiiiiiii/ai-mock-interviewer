import { useState } from "react";

const ROLE_PRESETS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "Machine Learning Engineer",
];

export default function SetupScreen({ onStart }) {
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    if (!role.trim()) { setError("Please enter a job role."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.trim(), jd: jd.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onStart({ sessionId: data.sessionId, role: role.trim(), firstMessage: data.message });
    } catch (e) {
      setError(e.message || "Something went wrong. Check your server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">
            <div className="logo-dot" />
            AI Mock<span>Interviewer</span>
          </div>
          <span className="nav-badge">HACK THE MATRIX</span>
        </nav>

        {/* Hero */}
        <div className="fade-up" style={{ textAlign: "center", padding: "48px 0 40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(0,194,203,0.08)", border: "1px solid rgba(0,194,203,0.2)",
            borderRadius: "20px", padding: "6px 16px", marginBottom: "24px",
            fontSize: "12px", fontWeight: 600, color: "var(--teal)", letterSpacing: "0.5px"
          }}>
            <span style={{ width: 6, height: 6, background: "var(--teal)", borderRadius: "50%", display: "inline-block" }} />
            AI-POWERED INTERVIEW PRACTICE
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
            lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "16px"
          }}>
            Practice smarter.<br />
            <span style={{ color: "var(--teal)" }}>Get hired faster.</span>
          </h1>

          <p style={{ fontSize: "16px", color: "var(--muted)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
            Real interview questions, AI evaluation, instant feedback — all for free, 24/7, for any role.
          </p>
        </div>

        {/* Stats row */}
        <div className="fade-up" style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
          marginBottom: "36px", animationDelay: "0.1s"
        }}>
          {[["10M+", "Job seekers in India"], ["₹0", "Cost to practice"], ["24/7", "Always available"]].map(([n, l]) => (
            <div key={n} className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--teal)", marginBottom: "4px" }}>{n}</div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Setup form */}
        <div className="card card-glow fade-up" style={{ animationDelay: "0.15s", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>
            Set up your interview
          </h2>

          {/* Role presets */}
          <div className="form-group">
            <label className="form-label">QUICK SELECT ROLE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              {ROLE_PRESETS.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    padding: "6px 14px", borderRadius: "8px", border: "1px solid",
                    borderColor: role === r ? "var(--teal)" : "var(--border2)",
                    background: role === r ? "var(--teal-glow)" : "transparent",
                    color: role === r ? "var(--teal)" : "var(--muted)",
                    fontSize: "12px", fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom role input */}
          <div className="form-group">
            <label className="form-label">OR TYPE A CUSTOM ROLE *</label>
            <input
              className="input"
              placeholder="e.g. React Developer, Data Scientist, PM at Google..."
              value={role}
              onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleStart()}
            />
          </div>

          {/* JD input */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">
              JOB DESCRIPTION <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional — paste for better questions)</span>
            </label>
            <textarea
              className="textarea input"
              placeholder="Paste the job description here. The AI will generate questions tailored to the exact role requirements..."
              value={jd}
              onChange={e => setJd(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)",
              borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
              color: "var(--danger)", fontSize: "13px"
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            onClick={handleStart}
            disabled={loading || !role.trim()}
          >
            {loading ? (
              <><div className="spinner" /> Preparing your interview...</>
            ) : (
              <> Start Interview →</>
            )}
          </button>
        </div>

        {/* Feature pills */}
        <div className="fade-up" style={{
          display: "flex", flexWrap: "wrap", gap: "10px",
          justifyContent: "center", paddingBottom: "48px", animationDelay: "0.25s"
        }}>
          {["🎤 Voice input", "🧠 Adaptive difficulty", "📊 Scored feedback", "📄 PDF export"].map(f => (
            <span key={f} style={{
              fontSize: "12px", color: "var(--muted)", background: "var(--surface)",
              border: "1px solid var(--border)", padding: "6px 14px", borderRadius: "20px"
            }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
