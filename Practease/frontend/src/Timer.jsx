import React, { useEffect, useState } from "react";

const Timer = ({ isTimeUp, setIsTimeUp, setResponseTime }) => {
    const [time, setTime] = useState(5);

    useEffect(() => {
        if (time <= 0) {
            setIsTimeUp(true);
            return;
        }

        const timer = setTimeout(() => {
            setTime((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [time]);

    useEffect(() => {
        setResponseTime(5 - time); 
    }, [time, setResponseTime]);

    return <p>Time Left: {time}s</p>;
};

export default Timer;
