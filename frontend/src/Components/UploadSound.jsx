import "./UploadSound.css";
import { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || `/api`;

export default function UploadSound({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [preview, setPreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setTitle("");
      setGenre("");
      setDuration("");
      setPreview(null);
      setMessage("");
      setUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      const previewUrl = URL.createObjectURL(selected);
      setPreview(previewUrl);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));

      const audio = new Audio(previewUrl);
      audio.addEventListener("loadedmetadata", () => {
        const roundedDuration = Math.round(audio.duration);
        setDuration(roundedDuration.toString());
      });
    }
  };

  const handleUpload = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to upload.");
      return;
    }

    try {
      setMessage("");
      setUploading(true);

      const token = await user.getIdToken();

      if (!file) {
        setMessage("Please select an audio file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("duration", Math.round(parseFloat(duration) || 0));

      const res = await fetch(`${BASE_URL}/user/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage("Upload failed: " + json.error);
      } else {
        setMessage("Uploaded successfully!");
        setTimeout(() => {
          setFile(null);
          setTitle("");
          setGenre("");
          setDuration("");
          setPreview(null);
          setMessage("");
          onClose();
        }, 2000);
      }
    } catch (err) {
      setMessage("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h2>Upload a Sample</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="container">
          <input type="file" accept="audio/*" onChange={handleFileChange} />

          {preview && (
            <audio
              controls
              src={preview}
              style={{ display: "block", width: "100%" }}
              onLoadedMetadata={(e) => {
                const roundedDuration = Math.round(e.target.duration);
                setDuration(roundedDuration.toString());
              }}
            />
          )}

          <input
            type="text"
            placeholder="Sample Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />

          {duration && (
            <div style={{ padding: "0.5rem", color: "#aaa" }}>
              Duration: {duration} seconds
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
