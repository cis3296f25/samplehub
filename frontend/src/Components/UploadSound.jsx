import "./UploadSound.css";
import { useState } from "react";
import { auth } from "./firebaseConfig";

export default function UploadSound() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [preview, setPreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, "")); // default title
    }
  };

  const handleUpload = async () => {
    try {
      setMessage("");
      setUploading(true);

      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in to upload.");
        return;
      }

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
      }
    } catch (err) {
      setMessage("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="container">
      <h2>Upload a Sample</h2>

      <input type="file" accept="audio/*" onChange={handleFileChange} />

      {preview && (
        <audio
          controls
          src={preview}
          style={{ marginTop: "10px", display: "block" }}
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
  );
}
