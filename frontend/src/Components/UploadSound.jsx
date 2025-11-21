import "./UploadSound.css";
import { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";

export default function UploadSound({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [preview, setPreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
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
      setPreview(URL.createObjectURL(selected));
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
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
      formData.append("duration", duration);

      const res = await fetch("http://localhost:5000/api/user/upload", {
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
      setProgress(0);
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
              style={{ marginTop: "10px", display: "block", width: "100%" }}
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

          <input
            type="number"
            placeholder="Duration (seconds)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
