import { useState, useEffect } from 'react'
import axios from "axios"
import RapidFire from './RapidFire';

function App(){
  const [message, setMessage] = useState("")

  useEffect(() => {
    axios.get("http://127.0.0.1:8080/api/test/")
    .then(response => {
      setMessage(response.data.message);
    })
    .catch(error => {
      console.error("error in fetching the data", error)
    });
  }, []);
  return (
    <div>
      <h1>Practease</h1>
      <p>{message ? message : "Loading..."}</p>

      <RapidFire />
    </div>
  );
}

export default App;
