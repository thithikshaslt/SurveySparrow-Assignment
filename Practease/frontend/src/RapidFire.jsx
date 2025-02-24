import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Timer from "./Timer";
import "./RapidFire.css";


const RapidFire = () => {
  const [analogyPrompt, setAnalogyPrompt] = useState("");
  const [promptId, setPromptId] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [aiEval, setAiEval] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");

  const mediaRecorderRef = useRef(null);
  const startTimeRef = useRef(null);
  const whisperWorkerRef = useRef(null);

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

  useEffect(() => {
    if (audioBlob) {
      console.log("Audio recorded. Enabling submit.");
      setIsSubmitEnabled(true);

      // Start transcription in the web worker
      whisperWorkerRef.current.postMessage({
        type: "TRANSCRIBE",
        audio: audioBlob,
      });
    }
  }, [audioBlob]);

  useEffect(() => {
    whisperWorkerRef.current = new Worker(
      new URL("/workers/whisperWorker.js", import.meta.url),
      {type: "module"}
    );
    console.log("YES")
    whisperWorkerRef.current.onmessage = (event) => {
      const { type, transcription, error } = event.data;
      if (type === "TRANSCRIPTION_RESULT") {
        setTranscription(transcription);
        console.log("Transcription:", transcription);
      } else if (type === "ERROR") {
        console.error("Transcription error:", error);
      }
    };
    console.log("HELL")
    return () => whisperWorkerRef.current.terminate();
  }, []);

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
            setIsSubmitEnabled(true); // Enable submit button immediately
            console.log("Recording finished. Blob size:", audioBlob.size);
          } else {
            console.error("No audio data captured.");
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      setResponseTime(elapsedTime);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      console.error("No audio recorded. Cannot submit.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("response_text", transcription);
    formData.append(
      "response_time",
      responseTime ? responseTime.toFixed(2) : "5.00"
    );
    formData.append("prompt", promptId);
    formData.append("response_audio", audioBlob, "response.wav");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/api/speakingexercise/rapidfire-responses/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAiEval(response.data);
      console.log("Submission successful:", response.data);
    } catch (error) {
      console.error("Error in submitting response:", error);
      if (error.response) {
        console.error("Backend Response:", error.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
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

      <button onClick={handleSubmit} disabled={!isSubmitEnabled || isSubmitting}>
        Submit
      </button>

      {responseTime !== null && (
        <p>
          <strong>Response Time:</strong> {responseTime.toFixed(2)} seconds
        </p>
      )}

      {transcription && (
        <div>
          <h3>Transcription</h3>
          <p>{transcription}</p>
        </div>
      )}

      {aiEval && (
        <div>
          <h3>AI Evaluation</h3>
          <p>Fluency: {aiEval.fluency_score}</p>
        </div>
      )}
    </div>
  );
};

export default RapidFire;
