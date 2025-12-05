import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { auth } from "../Components/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AddToPackModal from "../Components/AddToPackModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || `/api`;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("newest");

  const currentPage = parseInt(searchParams.get("page") || "1");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageInput, setPageInput] = useState("");

  const [favorites, setFavorites] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedSampleForPack, setSelectedSampleForPack] = useState(null);
  const [showAddToPackModal, setShowAddToPackModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
      if (currentUser) {
        fetchFavorites(currentUser);
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlDuration = searchParams.get("duration") || "";
    const urlOrder = searchParams.get("order") || "newest";
    const page = parseInt(searchParams.get("page") || "1");

    setSearchTerm(urlSearch);
    setSelectedDuration(urlDuration);
    setSelectedOrder(urlOrder);
    fetchSamples(page, false);
  }, [searchParams]);

  const fetchFavorites = async (currentUser) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${BASE_URL}/user/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.map((fav) => fav.sample_id));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchSamples = async (page = 1, resetFilters = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (!resetFilters) {
        if (searchTerm) params.append("search", searchTerm);
        if (selectedDuration) params.append("duration", selectedDuration);
        if (selectedOrder) params.append("order", selectedOrder);
      } else {
        params.append("order", "newest");
      }

      params.append("page", page);

      const response = await fetch(`${BASE_URL}/search?${params}`);
      const data = await response.json();

      if (data.samples) {
        setSamples(data.samples);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        setSamples(data);
      }
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page = 1) => {
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set("search", searchTerm);
    if (selectedDuration) newSearchParams.set("duration", selectedDuration);
    newSearchParams.set("order", selectedOrder || "newest");
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
    await fetchSamples(page, false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", newPage.toString());
      setSearchParams(newSearchParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setPageInput("");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 6;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis");
      return pages.concat(
        Array.from({ length: 5 }, (_, i) => totalPages - 4 + i),
      );
    }

    pages.push(
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    );
    return pages;
  };

  const toggleFavorite = async (sampleId) => {
    if (!isLoggedIn || !user) {
      return;
    }

    const isFavorited = favorites.includes(sampleId);

    setFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== sampleId) : [...prev, sampleId],
    );

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
          setFavorites(favorites.filter((id) => id !== sampleId));
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
          setFavorites([...favorites, sampleId]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavorites((prev) =>
        isFavorited
          ? [...prev, sampleId]
          : prev.filter((id) => id !== sampleId),
      );
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

  return (
    
    <section className="sample-discovery">
      <h1 className="main-title">
        Find, preview, and collect samples — all in one place.
      </h1>
<<<<<<< HEAD
      <div className="search-controls">
        <input 
        type="text" placeholder="Search samples..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
=======

      <form
        className="search-controls"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input
          type="text"
          placeholder="Search samples..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
>>>>>>> c2fd0386d949435574c944703a1375e3254ed21f
        />

        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value)}
        >
          <option value="">Duration</option>
          <option value="short">Short (&lt;10s)</option>
          <option value="medium">Medium (10–30s)</option>
          <option value="long">Long (&gt;30s)</option>
        </select>

        <select
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      <div className="samples-list">
        {loading ? (
          <div className="loading">Loading samples...</div>
        ) : samples.length === 0 ? (
          <div className="no-samples">No samples found.</div>
        ) : (
<<<<<<< HEAD
          samples.map((sample) => (
            <div key={sample.id} className={"sample-card " + sample.genre}>
              <div className="sample-header">
                <h3>{sample.title}</h3>
                {sample.genre && (
                  <span className="genre-tag">{sample.genre}</span>
                )}
                <button className="fav-btn" onClick={() => toggleFavorite(sample.id)}>{favorites.includes(sample.id) ? 'Favorite' : 'Not Favorite'}</button>
              </div>
=======
          <div className="dashboard-sample-list">
            {samples.map((sample) => (
              <div key={sample.id} className="dashboard-sample">
                <div className="dashboard-sample-info">
                  <div className="dashboard-title">{sample.title}</div>
>>>>>>> c2fd0386d949435574c944703a1375e3254ed21f

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

                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => toggleFavorite(sample.id)}
                      className="fav-btn"
                    >
                      {favorites.includes(sample.id) ? "❤️" : "🤍"}
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
<<<<<<< HEAD
      <div className="sample-info">
        <h1>Here is where the full information for a sample can be found</h1>
      </div>
=======

      {!loading && samples.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="pagination-ellipsis"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  className={`pagination-number ${
                    page === currentPage ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>

          <div className="pagination-jump">
            <form
              onSubmit={handlePageInputSubmit}
              className="pagination-jump-form"
            >
              <label htmlFor="page-input">Go to page:</label>
              <input
                id="page-input"
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={currentPage.toString()}
                className="pagination-input"
              />
              <button type="submit" className="pagination-jump-btn">
                Go
              </button>
            </form>
          </div>

          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalCount} total samples)
          </span>
        </div>
      )}

      <AddToPackModal
        isOpen={showAddToPackModal}
        onClose={() => {
          setShowAddToPackModal(false);
          setSelectedSampleForPack(null);
        }}
        sampleId={selectedSampleForPack}
      />
>>>>>>> c2fd0386d949435574c944703a1375e3254ed21f
    </section>
  );
}
