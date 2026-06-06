import { useState, useRef, useEffect } from "react";

export default function InterviewScreen({ sessionData, onFeedback, onQuit }) {
  const { sessionId, role, firstMessage } = sessionData;

  const [messages, setMessages] = useState([
    { from: "ai", text: firstMessage }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fetchingFeedback, setFetchingFeedback] = useState(false);
  const [qCount, setQCount] = useState(0);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const initialInputRef = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Voice input setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(result => result[0].transcript)
        .join("");
      
      const prefix = initialInputRef.current ? initialInputRef.current + " " : "";
      setInput(prefix + transcript);
    };
    rec.onerror = (e) => {
      console.error("Mic error:", e.error);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  function toggleVoice() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      initialInputRef.current = input;
      setIsListening(true);
      recognitionRef.current.start();
    }
  }

  async function sendAnswer() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://ai-mock-interviewer-sbk7.onrender.com/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answer: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: "ai", text: data.message }]);
      setQCount(c => c + 1);
      if (data.isDone) setIsDone(true);
    } catch {
      setMessages(prev => [...prev, { from: "ai", text: "⚠ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function getFeedback() {
    setFetchingFeedback(true);
    try {
      const res = await fetch("https://ai-mock-interviewer-sbk7.onrender.com/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      onFeedback(data);
    } catch {
      setFetchingFeedback(false);
      alert("Failed to get feedback. Please try again.");
    }
  }

  const progress = Math.min((qCount / 6) * 100, 100);

  return (
    <div className="page">
      <div className="container" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "10px",
              background: "linear-gradient(135deg, #00c2cb22, #00c2cb44)",
              border: "1px solid var(--teal-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px"
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>AI Interviewer</div>
              <div style={{ fontSize: "12px", color: "var(--teal)", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: 6, height: 6, background: "var(--teal)", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
                {role}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{
              fontSize: "12px", color: "var(--muted)",
              background: "var(--surface)", border: "1px solid var(--border)",
              padding: "5px 12px", borderRadius: "20px"
            }}>
              Q {Math.min(qCount + 1, 6)} / 6
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onQuit}>✕ Quit</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "var(--border)", borderRadius: 2, flexShrink: 0 }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, var(--teal), #0097a7)",
            borderRadius: 2, transition: "width 0.5s ease"
          }} />
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 0",
          display: "flex", flexDirection: "column", gap: "16px"
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className="fade-in"
              style={{
                display: "flex",
                flexDirection: msg.from === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
                background: msg.from === "ai"
                  ? "linear-gradient(135deg, #00c2cb22, #00c2cb44)"
                  : "linear-gradient(135deg, #1a3d5c, #0d2a45)",
                border: `1px solid ${msg.from === "ai" ? "var(--teal-dim)" : "var(--border2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px"
              }}>
                {msg.from === "ai" ? "🤖" : "👤"}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "80%",
                background: msg.from === "ai" ? "var(--card)" : "linear-gradient(135deg, #00c2cb18, #00c2cb08)",
                border: `1px solid ${msg.from === "ai" ? "var(--border)" : "var(--teal-dim)"}`,
                borderRadius: msg.from === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                padding: "14px 18px",
                fontSize: "14px", lineHeight: 1.7, color: "var(--text)"
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="fade-in" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
                background: "linear-gradient(135deg, #00c2cb22, #00c2cb44)",
                border: "1px solid var(--teal-dim)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
              }}>🤖</div>
              <div className="card" style={{ padding: "14px 18px" }}>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Feedback CTA */}
        {isDone && (
          <div className="fade-up" style={{
            margin: "0 0 16px",
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(0,194,203,0.08), rgba(0,150,160,0.05))",
            border: "1px solid var(--teal-dim)",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>Interview complete! 🎉</div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>Ready to see your detailed evaluation?</div>
            </div>
            <button
              className="btn btn-primary"
              onClick={getFeedback}
              disabled={fetchingFeedback}
            >
              {fetchingFeedback ? <><div className="spinner" /> Analyzing...</> : "Get Feedback →"}
            </button>
          </div>
        )}

        {/* Input area */}
        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: "16px",
          paddingBottom: "20px", flexShrink: 0
        }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              className="textarea input"
              style={{
                flex: 1, minHeight: "52px", maxHeight: "140px", resize: "none",
                borderRadius: "14px", paddingTop: "14px"
              }}
              placeholder={isDone ? "Interview complete — click Get Feedback above" : isListening ? "🎤 Listening... speak now" : "Type your answer here..."}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "52px";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendAnswer();
                }
              }}
              disabled={isDone || loading}
            />

            {/* Voice button */}
            <button
              className="btn btn-icon"
              style={{
                width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
                background: isListening ? "rgba(0,194,203,0.2)" : "var(--card)",
                border: `1px solid ${isListening ? "var(--teal)" : "var(--border2)"}`,
                color: isListening ? "var(--teal)" : "var(--muted)",
                fontSize: "20px",
                animation: isListening ? "glow 1s ease-in-out infinite" : "none"
              }}
              onClick={toggleVoice}
              disabled={isDone || loading}
              title={recognitionRef.current ? "Voice input" : "Voice not supported in this browser"}
            >
              {isListening ? "⏹" : "🎤"}
            </button>

            {/* Send button */}
            <button
              className="btn btn-primary"
              style={{ height: 52, borderRadius: "14px", paddingInline: "20px", flexShrink: 0 }}
              onClick={sendAnswer}
              disabled={isDone || loading || !input.trim()}
            >
              {loading ? <div className="spinner" /> : "Send ↑"}
            </button>
          </div>

          <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--muted)", textAlign: "center" }}>
            Press Enter to send  •  Shift+Enter for new line  •  🎤 for voice input
          </div>
        </div>
      </div>
    </div>
  );
}
