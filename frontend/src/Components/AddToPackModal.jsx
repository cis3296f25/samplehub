import { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export default function AddToPackModal({ isOpen, onClose, sampleId }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState("");
  const [newPackName, setNewPackName] = useState("");
  const [creatingPack, setCreatingPack] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen && sampleId) {
      fetchPacks();
    }
  }, [isOpen, sampleId]);

  const fetchPacks = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(`${BASE_URL}/user/packs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPacks(data);
      }
    } catch (error) {
      console.error("Error fetching packs:", error);
      setMessage("Failed to load packs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToExistingPack = async () => {
    if (!selectedPackId) {
      setMessage("Please select a pack");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in");
      return;
    }

    try {
      setMessage("");
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(
        `${BASE_URL}/user/packs/${selectedPackId}/samples`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sampleId }),
        },
      );

      await response.json();

      if (response.ok) {
        setMessage("Sample added to pack successfully!");
        setTimeout(() => {
          onClose();
          setMessage("");
          setSelectedPackId("");
        }, 1500);
      }
    } catch (error) {
      console.error("Error adding to pack:", error);
      setMessage("Failed to add sample to pack");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPackName.trim()) {
      setMessage("Please enter a pack name");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in");
      return;
    }

    try {
      setMessage("");
      setCreatingPack(true);
      const token = await user.getIdToken();
      const response = await fetch(`${BASE_URL}/user/packs/create-and-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packName: newPackName.trim(),
          sampleId,
        }),
      });

      await response.json();

      if (response.ok) {
        setMessage("Pack created and sample added successfully!");
        setTimeout(() => {
          onClose();
          setMessage("");
          setNewPackName("");
          fetchPacks();
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating pack:", error);
      setMessage("Failed to create pack");
    } finally {
      setCreatingPack(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h2>Add Sample to Pack</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="container">
          <div className="section">
            <h3 style={{ color: "white" }}>Add to Existing Pack</h3>
            {loading && packs.length === 0 ? (
              <p className="text-muted">Loading packs...</p>
            ) : packs.length === 0 ? (
              <p className="text-muted">No packs found</p>
            ) : (
              <>
                <select
                  value={selectedPackId}
                  onChange={(e) => setSelectedPackId(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    background: "black",
                    color: "white",
                    fontSize: "1rem",
                    width: "100%",
                    marginBottom: "0.75rem",
                  }}
                >
                  <option value="">Select a pack...</option>
                  {packs.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name} ({pack.sample_count || 0} samples)
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddToExistingPack}
                  disabled={loading || !selectedPackId}
                >
                  {loading ? "Loading..." : "Add to Pack"}
                </button>
              </>
            )}
          </div>

          <div>
            <h3 style={{ color: "white" }}>Create New Pack</h3>
            <input
              type="text"
              placeholder="Pack Name"
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
              style={{ marginBottom: "0.75rem" }}
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={creatingPack || !newPackName.trim()}
              style={{ width: "100%" }}
            >
              {creatingPack ? "Creating..." : "Create Pack & Add Sample"}
            </button>
          </div>

          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}
