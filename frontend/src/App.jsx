import React, { useEffect } from "react";

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

  return <h1>🎵 Freesound Test</h1>;
}
