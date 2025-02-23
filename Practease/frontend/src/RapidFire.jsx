import { useState, useEffect, useRef } from "react";
import axios from "axios";
import React from "react";
import Timer from './Timer';
import "./RapidFire.css";

const RapidFire = () => {
    const [analogyPrompt, setAnalogyPrompt] = useState('');
    const [promptId, setPromptId] = useState(null);
    const [userResponse, setUserResponse] = useState('');
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [aiEval, setAiEval] = useState(null);
    const [responseTime, setResponseTime] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8080/api/speakingexercise/rapidfire-exercises/')
        .then((response) => {
            const randomIdx = Math.floor(Math.random() * response.data.length);
            const selectedPrompt = response.data[randomIdx];
            setAnalogyPrompt(response.data[randomIdx].analogy_prompt);
            setPromptId(selectedPrompt.id);
        })
        .catch((error) => console.error('Error fetching analogy:', error));
    }, []);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();
                setIsRecording(true);
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    chunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                    setAudioBlob(audioBlob);
                };

                // Speech Recognition Setup
                const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognition.lang = "en-US";
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = (event) => {
                    setUserResponse(event.results[0][0].transcript);
                };

                recognition.start();

                setTimeout(() => {
                    mediaRecorder.stop();
                    recognition.stop();
                    setIsRecording(false);
                }, responseTime * 1000);
            })
            .catch((error) => console.error("Error accessing microphone:", error));
    };

    const handleSubmit = async () => {
        if (!audioBlob) {
            console.error("No audio recorded.");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("response_text", userResponse);
        formData.append("response_time", responseTime);
        formData.append("prompt",promptId);
        formData.append("response_audio", audioBlob, "response.wav");

        console.log("Submitting:", Object.fromEntries(formData.entries()));

        try {
            const response = await axios.post(
                'http://127.0.0.1:8080/api/speakingexercise/rapidfire-responses/',
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setAiEval(response.data);
        } catch (error) {
            console.error('Error in submitting response:', error);
            if (error.response) {
                console.error('Backend Response:', error.response.data);
            }
        }
    };

    return (
        <div className="exercise-container">
            <h2>Rapid Fire Analogies Exercise</h2>
            <p>{analogyPrompt}</p>

            <Timer 
                isTimeUp={isTimeUp}
                setIsTimeUp={setIsTimeUp}
                setResponseTime={setResponseTime}
            />

            <button onClick={startRecording} disabled={isRecording || isTimeUp}>
                {isRecording ? "Recording..." : "Start Speaking"}
            </button>

            <button onClick={handleSubmit} disabled={!audioBlob || isSubmitting || isTimeUp}>
                Submit
            </button>

            {userResponse && <p><strong>Detected Text:</strong> {userResponse}</p>}
            
            {aiEval && (
                <div>
                    <h3>AI Eval:</h3>
                    <p>Fluency: {aiEval.fluency_score}</p>
                </div>
            )}
        </div>
    );
};

export default RapidFire;
