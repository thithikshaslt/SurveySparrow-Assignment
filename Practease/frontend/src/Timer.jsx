import React, {useEffect, useState} from "react";

const Timer = ({isTimeUp, setIsTimeUp, setResponseTime}) => {
    const [time, setTime] = useState(5);

    useEffect(() => {
        if(time <= 0){
            setIsTimeUp(true);
            setResponseTime(5);
            return;
        }

        const timer = setTimeout(() => {
            setTime(time-1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [time]);

    return <p>Time Left: {time}s</p>
};

export default Timer;