import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sessions = new Map();

function getSystemPrompt(role, jd) {
  return `You are an experienced senior interviewer at a top tech company. You are interviewing a candidate for the role of "${role}".

${jd ? `The job description is:\n${jd}\n` : ""}

RULES:
- Ask ONE question at a time. Never ask multiple questions together.
- Mix question types naturally: start with an intro/warm-up, then go behavioral, then technical, then situational.
- Keep each question concise and clear.
- After the candidate answers, briefly acknowledge their response (1 sentence max), then ask the next question.
- After 5-6 questions, wrap up professionally with: "Thank you, those are all my questions. Click 'Get Feedback' to see your evaluation."
- Be professional but friendly. Do NOT add meta-commentary like "Here's my next question:".
- Respond with ONLY the interview message — no labels, no explanations.`;
}

function getFeedbackPrompt(role, history) {
  return `You are an expert interview coach. Analyze this complete mock interview for the role of "${role}" and provide detailed, honest feedback.

INTERVIEW TRANSCRIPT:
${history.map(m => `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER"}: ${m.content}`).join("\n\n")}

Provide feedback as a JSON object (respond with ONLY valid JSON, no markdown fences):
{
  "overallScore": <number 1-10>,
  "scores": {
    "communication": <number 1-10>,
    "technical": <number 1-10>,
    "clarity": <number 1-10>,
    "confidence": <number 1-10>
  },
  "strengths": [<3 specific strengths from the interview>],
  "improvements": [<3 specific areas to improve with actionable tips>],
  "summary": "<2-3 sentence honest overall assessment>",
  "verdict": "<one of: Strong Hire | Hire | Borderline | No Hire>"
}`;
}

// Start interview
app.post("/api/start", async (req, res) => {
  try {
    const { role, jd } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });

    const sessionId = uuidv4();
    const history = [];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemPrompt(role, jd) },
        { role: "user", content: "Please start the interview." }
      ],
      max_tokens: 300,
    });

    const aiMessage = response.choices[0].message.content;
    history.push({ role: "user", content: "Please start the interview." });
    history.push({ role: "assistant", content: aiMessage });
    sessions.set(sessionId, { role, jd, history });

    res.json({ sessionId, message: aiMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

// Submit answer
app.post("/api/answer", async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    session.history.push({ role: "user", content: answer });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemPrompt(session.role, session.jd) },
        ...session.history
      ],
      max_tokens: 400,
    });

    const aiMessage = response.choices[0].message.content;
    session.history.push({ role: "assistant", content: aiMessage });

    const isDone =
      aiMessage.toLowerCase().includes("get feedback") ||
      aiMessage.toLowerCase().includes("all my questions") ||
      aiMessage.toLowerCase().includes("that concludes") ||
      session.history.filter(m => m.role === "user").length >= 7;

    res.json({ message: aiMessage, isDone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process answer" });
  }
});

// Get feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const realHistory = session.history.filter(m => m.content !== "Please start the interview.");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: getFeedbackPrompt(session.role, realHistory) }
      ],
      max_tokens: 1000,
    });

    const raw = response.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(cleaned);

    sessions.delete(sessionId);
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));