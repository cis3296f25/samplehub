import { useState, useEffect, useRef } from "react";
import "./RandomYoutube.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || `/api`;

export default function RandomYoutube() {
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);

  const fetchRandomVideo = async () => {
    const res = await fetch(`${BASE_URL}/random`);
    const data = await res.json();
    return data.videoId;
  };

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, []);

  const initializePlayer = () => {
    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      height: 500,
      width: 1000,
      events: {
        onReady: async (event) => {
          const videoId = await fetchRandomVideo();
          event.target.loadVideoById(videoId);
          setLoading(false);
        },
      },
    });
  };

  const handleNextVideo = async () => {
    if (!playerInstanceRef.current) {
      return false;
    }

    setLoading(true);
    const videoId = await fetchRandomVideo();
    playerInstanceRef.current.loadVideoById(videoId);

    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="container">
      <h1 className="title">Discover your sound</h1>

      <button
        onClick={handleNextVideo}
        disabled={loading}
        className="next-button"
      >
        {loading ? "Loading..." : "Next Video"}
      </button>

      <div ref={playerRef}></div>
    </div>
  );
}
