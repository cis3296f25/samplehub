import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default function App() {
  useEffect(() => {
    async function testBackend() {
      try {
        const res = await fetch("http://localhost:5000/api/sound/830227");
        const data = await res.json();

        console.log(data);
        
        const audio = new Audio(data.previews["preview-hq-mp3"]);
        const playButton = document.createElement("button");
        playButton.textContent = "Play Sound";
        playButton.onclick = () => audio.play();
        document.body.appendChild(playButton);
      } catch (err) {
        console.error("Error fetching sound:", err);
      }
    }

    testBackend();
  }, []);

  return <h1>Freesound Test</h1>;
}
