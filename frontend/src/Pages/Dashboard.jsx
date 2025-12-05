import { useState, useEffect } from "react";
import { auth } from "../Components/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AddToPackModal from "../Components/AddToPackModal";
import "./Dashboard.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || `/api`;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("packs");
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);
  const [packSamples, setPackSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [newPackName, setNewPackName] = useState("");
  const [creatingPack, setCreatingPack] = useState(false);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const [showAddToPackModal, setShowAddToPackModal] = useState(false);
  const [selectedSampleForPack, setSelectedSampleForPack] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === "packs") {
        fetchPacks();
      } else if (activeTab === "favorites") {
        fetchFavorites();
      }
    }
  }, [user, activeTab]);

  const fetchPacks = async () => {
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
      } else {
        console.error("Failed to fetch packs:", response.status);
      }
    } catch (error) {
      console.error("Error fetching packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoadingFavorites(true);
      const token = await user.getIdToken();
      const response = await fetch(`${BASE_URL}/user/favorites/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        console.error("Failed to fetch favorites:", response.status);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchPackSamples = async (packId) => {
    if (!user || !packId) return;

    try {
      setLoadingSamples(true);
      const token = await user.getIdToken();
      const response = await fetch(`${BASE_URL}/user/packs/${packId}/samples`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPackSamples(data);
      } else {
        console.error("Failed to fetch pack samples:", response.status);
      }
    } catch (error) {
      console.error("Error fetching pack samples:", error);
    } finally {
      setLoadingSamples(false);
    }
  };

  const handlePackClick = (pack) => {
    if (selectedPack?.id === pack.id) {
      setSelectedPack(null);
      setPackSamples([]);
    } else {
      setSelectedPack(pack);
      fetchPackSamples(pack.id);
    }
  };

  const handleCreatePack = async (e) => {
    e.preventDefault();
    if (!newPackName.trim() || !user) return;

    try {
      setCreatingPack(true);
      const token = await user.getIdToken();

      const response = await fetch(`${BASE_URL}/user/packs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packName: newPackName.trim() }),
      });

      if (response.ok) {
        setNewPackName("");
        await fetchPacks();
      } else {
        console.error("Failed to create pack:", response.status);
      }
    } catch (error) {
      console.error("Error creating pack:", error);
    } finally {
      setCreatingPack(false);
    }
  };

  const handleDeletePack = async (packId, e) => {
    e.stopPropagation();
    if (!user || !confirm("Are you sure you want to delete this pack?")) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${BASE_URL}/user/packs/${packId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        if (selectedPack?.id === packId) {
          setSelectedPack(null);
          setPackSamples([]);
        }
        await fetchPacks();
      } else {
        console.error("Failed to delete pack:", response.status);
      }
    } catch (error) {
      console.error("Error deleting pack:", error);
    }
  };

  const downloadFile = async (sampleId, name) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${BASE_URL}/user/download/${sampleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error during file download:", error);
    }
  };

  const handleRemoveSample = async (sampleId, e) => {
    e.stopPropagation();
    if (!user || !selectedPack) return;
    if (!confirm("Are you sure you want to remove this sample?")) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${BASE_URL}/user/packs/${selectedPack.id}/samples/${sampleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        await fetchPackSamples(selectedPack.id);
        await fetchPacks();
      } else {
        console.error("Failed to remove sample:", response.status);
      }
    } catch (error) {
      console.error("Error removing sample:", error);
    }
  };

  const handleToggleFavorite = async (sampleId) => {
    if (!user) return;

    const isFavorited = favorites.some((fav) => fav.id === sampleId);

    try {
      const token = await user.getIdToken();

      if (isFavorited) {
        const response = await fetch(
          `${BASE_URL}/user/favorites?sampleId=${sampleId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          setFavorites((prev) => prev.filter((fav) => fav.id !== sampleId));
        } else {
          console.error("Failed to remove favorite:", response.status);
        }
      } else {
        const response = await fetch(`${BASE_URL}/user/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sampleId }),
        });

        if (response.ok) {
          await fetchFavorites();
        } else {
          console.error("Failed to add favorite:", response.status);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAddToPack = (sampleId) => {
    setSelectedSampleForPack(sampleId);
    setShowAddToPackModal(true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="dashboard">
      <h2>My Dashboard</h2>

      <div className="dashboard-tabs">
        <button
          onClick={() => setActiveTab("packs")}
          className={`dashboard-tab ${activeTab === "packs" ? "active" : ""}`}
        >
          Sample Packs
        </button>

        <button
          onClick={() => {
            setActiveTab("favorites");
            if (favorites.length === 0 && user) fetchFavorites();
          }}
          className={`dashboard-tab ${activeTab === "favorites" ? "active" : ""}`}
        >
          Favorites
        </button>
      </div>

      {activeTab === "packs" ? (
        <>
          <h3 style={{ marginBottom: "1.5rem" }}>My Sample Packs</h3>

          <form onSubmit={handleCreatePack} className="dashboard-create-form">
            <div className="dashboard-create-container">
              <input
                type="text"
                placeholder="New pack name"
                value={newPackName}
                onChange={(e) => setNewPackName(e.target.value)}
                className="dashboard-input-text"
              />
              <button
                type="submit"
                disabled={creatingPack || !newPackName.trim()}
                className="dashboard-btn-primary"
              >
                {creatingPack ? "Creating..." : "Create Pack"}
              </button>
            </div>
          </form>

          {loading ? (
            <p>Loading packs...</p>
          ) : packs.length === 0 ? (
            <p className="dashboard-empty">No packs yet</p>
          ) : (
            <div className="dashboard-grid">
              <div>
                <h3 style={{ marginBottom: "1rem" }}>Your Packs</h3>
                <div className="dashboard-pack-list">
                  {packs.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => handlePackClick(pack)}
                      className={`dashboard-pack-item ${
                        selectedPack?.id === pack.id ? "active" : ""
                      }`}
                    >
                      <div>
                        <div className="dashboard-title">{pack.name}</div>
                        <div className="dashboard-meta">
                          {pack.sample_count || 0} samples
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeletePack(pack.id, e)}
                        className="dashboard-btn-remove"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {selectedPack ? (
                  <>
                    <h3 style={{ marginBottom: "1rem" }}>
                      {selectedPack.name}
                    </h3>

                    <p
                      className="dashboard-empty"
                      style={{ marginBottom: "1rem" }}
                    >
                      To add samples to this pack, go to Home and click "Add to
                      Pack"
                    </p>

                    {loadingSamples ? (
                      <p>Loading samples...</p>
                    ) : packSamples.length === 0 ? (
                      <p className="dashboard-empty">This pack is empty</p>
                    ) : (
                      <div className="dashboard-sample-list">
                        {packSamples.map((sample) => (
                          <div key={sample.id} className="dashboard-sample">
                            <div className="dashboard-sample-info">
                              <div className="dashboard-title">
                                {sample.title}
                              </div>

                              <div className="dashboard-meta">
                                <span>
                                  Duration: {formatDuration(sample.duration)}
                                </span>
                                {sample.genre && (
                                  <span>Genre: {sample.genre}</span>
                                )}
                              </div>

                              {sample.preview_url && (
                                <audio controls className="dashboard-audio">
                                  <source
                                    src={sample.preview_url}
                                    type="audio/mpeg"
                                  />
                                </audio>
                              )}
                            </div>

                            <button
                              onClick={(e) => handleRemoveSample(sample.id, e)}
                              className="dashboard-btn-remove"
                            >
                              Remove
                            </button>

                            <button
                              className="add-to-pack-btn"
                              onClick={async () => {
                                if (!user) return;
                                await downloadFile(
                                  sample.id,
                                  `${sample.title}.mp3`,
                                );
                              }}
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="dashboard-empty">
                    Select a pack to view its samples
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 style={{ marginBottom: "1.5rem" }}>My Favorites</h3>

          {loadingFavorites ? (
            <p>Loading favorites...</p>
          ) : favorites.length === 0 ? (
            <p className="dashboard-empty">No favorites yet</p>
          ) : (
            <div className="dashboard-sample-list">
              {favorites.map((sample) => (
                <div key={sample.id} className="dashboard-sample">
                  <div className="dashboard-sample-info">
                    <div className="dashboard-title">{sample.title}</div>

                    <div className="dashboard-meta">
                      <span>Duration: {formatDuration(sample.duration)}</span>
                      {sample.genre && <span>Genre: {sample.genre}</span>}
                    </div>

                    {sample.preview_url && (
                      <audio controls className="dashboard-audio">
                        <source src={sample.preview_url} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(sample.id)}
                    className="dashboard-btn-remove"
                  >
                    Unfavorite
                  </button>

                  <button
                    className="add-to-pack-btn"
                    onClick={() => handleAddToPack(sample.id)}
                  >
                    Add to Pack
                  </button>

                  <button
                    className="add-to-pack-btn"
                    onClick={async () => {
                      if (!user) return;
                      await downloadFile(sample.id, `${sample.title}.mp3`);
                    }}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AddToPackModal
        isOpen={showAddToPackModal}
        onClose={() => {
          setShowAddToPackModal(false);
          setSelectedSampleForPack(null);
        }}
        sampleId={selectedSampleForPack}
      />
    </section>
  );
}
