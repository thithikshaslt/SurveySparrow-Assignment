import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Timer from "./Timer";
import "./RapidFire.css";

const RapidFire = () => {
  const [analogyPrompt, setAnalogyPrompt] = useState("");
  const [promptId, setPromptId] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [aiEval, setAiEval] = useState(null);

  const mediaRecorderRef = useRef(null);
  const startTimeRef = useRef(null);
  const whisperWorkerRef = useRef(null);

  

  // **Properly initialize the Web Worker**
  useEffect(() => {
    whisperWorkerRef.current = new Worker(
      new URL("/src/workers/whisperWorker.js", import.meta.url),
      { type: "module" }
    );

    console.log("✅ Whisper Worker Initialized");

    whisperWorkerRef.current.onmessage = (event) => {
      console.log("📩 Whisper Worker Response:", event.data); // Check what response is received
  
      const { type, transcription, error } = event.data;
      if (type === "TRANSCRIPTION_RESULT") {
        console.log("✅ Transcription Received:", transcription);
        if (transcription.trim() === "") {
          console.warn("⚠️ Whisper returned an empty transcription!");
        }
        setTranscription(transcription);
      } else if (type === "ERROR") {
        console.error("❌ Whisper Worker Error:", error);
      }
    };

    return () => whisperWorkerRef.current.terminate();
  }, []);

  // **Fetch Random Analogy Prompt**
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8080/api/speakingexercise/rapidfire-exercises/")
      .then((response) => {
        const randomIdx = Math.floor(Math.random() * response.data.length);
        const selectedPrompt = response.data[randomIdx];
        setAnalogyPrompt(selectedPrompt.analogy_prompt);
        setPromptId(selectedPrompt.id);
      })
      .catch((error) => console.error("Error fetching analogy:", error));
  }, []);

  // **Handle Transcription After Recording**
  useEffect(() => {
    if (audioBlob) {
      console.log("Audio recorded. Sending to Whisper worker...");
  
      const reader = new FileReader();
      reader.readAsArrayBuffer(audioBlob);
  
      reader.onloadend = () => {
        const audioBuffer = reader.result;
        console.log("Sending audio buffer to WhisperWorker:", audioBuffer);
  
        whisperWorkerRef.current.postMessage({
          type: "TRANSCRIBE",
          audio: audioBuffer,
        });
      };
    }
  }, [audioBlob]);
  
  // **Start Recording**
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        let chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: "audio/wav" });
            setAudioBlob(audioBlob);
            setIsSubmitEnabled(true);
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        startTimeRef.current = Date.now();

        // Auto-stop after 5 seconds
        setTimeout(() => {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setIsRecording(false);
            setIsTimeUp(true);

            const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
            setResponseTime(elapsedTime);
          }
        }, 5000);
      })
      .catch((error) => console.error("Error accessing microphone:", error));
  };

  // **Stop Recording**
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      setResponseTime(elapsedTime);
    }
  };

  // **Submit Response**
  const handleSubmit = () => {
    if (!transcription) {
      alert("Transcription is empty! Please try again.");
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      analogy_exercise: promptId,
      user_response: transcription,
      response_time: responseTime,
    };

    axios
      .post("http://127.0.0.1:8080/api/speakingexercise/rapidfire-responses/", requestData)
      .then((response) => {
        console.log("Submission successful:", response.data);
        setAiEval(response.data.ai_evaluation);
        alert("Response submitted successfully!");
      })
      .catch((error) => {
        console.error("Error submitting response:", error);
        alert("Failed to submit response.");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="exercise-container">
      <h2>Rapid Fire Analogies Exercise</h2>
      <p>{analogyPrompt}</p>

      <Timer isTimeUp={isTimeUp} setIsTimeUp={setIsTimeUp} />

      <button onClick={startRecording} disabled={isRecording || isTimeUp}>
        {isRecording ? "Recording..." : "Start Speaking"}
      </button>

      {isRecording && (
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      )}

      {transcription && (
        <div>
          <h3>Transcription</h3>
          <p>{transcription}</p>
        </div>
      )}

      {/* Submit Button */}
      <button onClick={handleSubmit} disabled={!isSubmitEnabled || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Response"}
      </button>

      {aiEval && (
        <div>
          <h3>AI Evaluation</h3>
          <p>{aiEval}</p>
        </div>
      )}
    </div>
  );
};

export default RapidFire;
