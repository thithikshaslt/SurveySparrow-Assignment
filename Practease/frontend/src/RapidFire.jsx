import { useState, useEffect } from "react";
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
    const [responseTime, setResponseTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axios.get('http://127.0.0.1:8080/api/speakingexercise/rapidfire-exercises/')
        .then((response) => {
            const randomIdx = Math.floor(Math.random() * response.data.length);
            setAnalogyPrompt(response.data[randomIdx].analogy_prompt);
            setPromptId(response.data[randomIdx].id);
        })
        .catch((error) => console.error('error in fetching analogy:', error));

    }, []);

    const handleChange = (e) => {
        setUserResponse(e.target.value);
    };

    const handleSubmit = () => {
        if(!userResponse.trim()) {
            console.error("response text is empty");
            return;
        }

        setIsSubmitting(true);

        const data = {
            // session_id : "12345",
            response_text : userResponse,
            response_time : responseTime || 5, 
            prompt : promptId,
        };
        console.log("sending data:", data)

        axios.post('http://127.0.0.1:8080/api/speakingexercise/rapidfire-responses/', data)
        .then((response) => {
            setAiEval(response.data);
        })
        .catch((error) => console.error('error in submitting response:', error));
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

            <textarea
                value={userResponse}
                onChange={handleChange}
                disabled={isTimeUp}
                placeholder="Your response..."
            />

            <button
                onClick={handleSubmit}
                disabled = {isSubmitting || isTimeUp}
            >
            Submit
            </button>

            {
                aiEval && (
                    <div>
                        <h3>AI Eval:</h3>
                        <p>Fluency: {aiEval.fluency_score}</p>
                    </div>
                )
            }
        </div>
    );
};

export default RapidFire;