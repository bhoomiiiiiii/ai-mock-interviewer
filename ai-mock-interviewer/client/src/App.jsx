import { useState } from "react";
import SetupScreen from "./components/SetupScreen";
import InterviewScreen from "./components/InterviewScreen";
import FeedbackScreen from "./components/FeedbackScreen";

export default function App() {
  const [screen, setScreen] = useState("setup"); // setup | interview | feedback
  const [sessionData, setSessionData] = useState(null);   // { sessionId, role }
  const [feedback, setFeedback] = useState(null);

  function handleStart(data) {
    setSessionData(data);
    setScreen("interview");
  }

  function handleFeedback(data) {
    setFeedback(data);
    setScreen("feedback");
  }

  function handleRestart() {
    setSessionData(null);
    setFeedback(null);
    setScreen("setup");
  }

  return (
    <>
      {screen === "setup"     && <SetupScreen onStart={handleStart} />}
      {screen === "interview" && <InterviewScreen sessionData={sessionData} onFeedback={handleFeedback} onQuit={handleRestart} />}
      {screen === "feedback"  && <FeedbackScreen feedback={feedback} role={sessionData?.role} onRestart={handleRestart} />}
    </>
  );
}
