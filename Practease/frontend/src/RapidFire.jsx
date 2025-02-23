import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Timer from "./Timer";
import "./RapidFire.css";

const RapidFire = () => {
    const [analogyPrompt, setAnalogyPrompt] = useState("");
    const [promptId, setPromptId] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const [userResponse, setUserResponse] = useState("");
    const [audioBlob, setAudioBlob] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const startTimeRef = useRef(null);
    const firstSpeechTimeRef = useRef(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:8080/api/speakingexercise/rapidfire-exercises/")
            .then((response) => {
                const randomIdx = Math.floor(Math.random() * response.data.length);
                const selectedPrompt = response.data[randomIdx];
                setAnalogyPrompt(selectedPrompt.analogy_prompt);
                setPromptId(selectedPrompt.id);
                startTimeRef.current = Date.now(); 
            })
            .catch((error) => console.error("Error fetching analogy:", error));
    }, []);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];
                firstSpeechTimeRef.current = null;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);

                        if (!firstSpeechTimeRef.current) {
                            firstSpeechTimeRef.current = Date.now(); 
                            setResponseTime(((firstSpeechTimeRef.current - startTimeRef.current) / 1000).toFixed(2));
                        }
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                    setAudioBlob(audioBlob);
                    setIsSubmitEnabled(true);
                    console.log("Recording finished. Blob size:", audioBlob.size);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            })
            .catch((error) => console.error("Error accessing microphone:", error));
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async () => {
        if (!audioBlob) {
            console.error("No audio recorded. Cannot submit.");
            return;
        }

        const formData = new FormData();
        formData.append("response_text", userResponse);
        formData.append("response_time", responseTime || "5.00");
        formData.append("prompt", promptId);
        formData.append("response_audio", audioBlob, "response.wav");

        try {
            const response = await axios.post(
                "http://127.0.0.1:8080/api/speakingexercise/rapidfire-responses/",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            console.log("Submission successful:", response.data);
        } catch (error) {
            console.error("Error in submitting response:", error);
        }
    };

    return (
        <div className="exercise-container">
            <h2>Rapid Fire Analogies Exercise</h2>
            <p>{analogyPrompt}</p>
            
            <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
            <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
            
            <button onClick={handleSubmit} disabled={!isSubmitEnabled}>Submit</button>

            {responseTime && <p><strong>Response Time:</strong> {responseTime} seconds</p>}
        </div>
    );
};

export default RapidFire;
