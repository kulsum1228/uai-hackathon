// ============================================================
// pages/MedicineSearch.jsx — Search medicines across pharmacies
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { medicineAPI } from "../services/api";
import MedicineCard from "../components/MedicineCard";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .ms-page {
    min-height: calc(100vh - 65px);
    background: #f4f7f4;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .ms-inner { max-width: 720px; margin: 0 auto; }

  .ms-back {
    background: none; border: none; color: #2d7a4f; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0;
    margin-bottom: 14px; display: flex; align-items: center; gap: 4px;
  }
  .ms-back:hover { text-decoration: underline; }
  .ms-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px; color: #1a3a2a; margin: 0 0 4px;
  }
  .ms-subtitle { font-size: 13px; color: #7a9a8a; margin: 0 0 24px; }

  /* Search bar */
  .ms-search-card {
    background: #fff; border: 1px solid #d8e8d8;
    border-radius: 12px; padding: 20px; margin-bottom: 20px;
  }
  .ms-search-row { display: flex; gap: 8px; }
  .ms-search-input {
    flex: 1; border: 1px solid #ccdacc; border-radius: 7px;
    padding: 11px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #1a3a2a; background: #f8faf8; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ms-search-input:focus {
    border-color: #2d7a4f;
    box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
    background: #fff;
  }
  .ms-search-btn {
    background: #2d7a4f; color: #fff; border: none; border-radius: 7px;
    padding: 11px 20px; font-size: 14px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s; white-space: nowrap;
  }
  .ms-search-btn:hover:not(:disabled) { background: #1f5c39; }
  .ms-search-btn:disabled { background: #a0bfaa; cursor: not-allowed; }

  /* Filters */
  .ms-filters {
    display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;
  }
  .ms-filter-btn {
    padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
    cursor: pointer; border: 1px solid #ccdacc; background: #f4f7f4;
    color: #4a6a5a; font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .ms-filter-btn.active {
    background: #2d7a4f; color: #fff; border-color: #2d7a4f;
  }

  /* Quick search chips */
  .ms-quick-label { font-size: 12px; color: #7a9a8a; margin-bottom: 8px; }
  .ms-quick-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .ms-quick-chip {
    padding: 5px 12px; border-radius: 20px; font-size: 12px;
    background: #e8f5ee; color: #2d7a4f; border: 1px solid #b0d8bc;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background 0.15s;
  }
  .ms-quick-chip:hover { background: #d0eedd; }

  /* Results */
  .ms-results-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .ms-results-title { font-size: 14px; font-weight: 600; color: #1a3a2a; }
  .ms-results-count { font-size: 12px; color: #7a9a8a; }

  .ms-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: #7a9a8a; margin: 0 0 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .ms-dot-in { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
  .ms-dot-out { width: 7px; height: 7px; border-radius: 50%; background: #ef4444; }

  .ms-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 12px; margin-bottom: 20px;
  }

  /* States */
  .ms-empty {
    text-align: center; padding: 48px 24px; color: #7a9a8a;
    background: #fff; border: 1px solid #d8e8d8; border-radius: 12px;
  }
  .ms-empty-icon { font-size: 36px; margin-bottom: 10px; }
  .ms-empty-title { font-size: 15px; font-weight: 600; color: #4a6a5a; margin-bottom: 4px; }
  .ms-empty-desc { font-size: 13px; }

  .ms-loading { text-align: center; padding: 40px; color: #7a9a8a; font-size: 14px; }

  /* Cached badge */
  .ms-cached-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: #fff8e0; border: 1px solid #f5d060; color: #a16207;
    border-radius: 20px; padding: 3px 10px; font-size: 11px; margin-left: 8px;
  }

  @media (max-width: 560px) { .ms-grid { grid-template-columns: 1fr; } }
`;

const QUICK_SEARCHES = ["Paracetamol", "Amoxicillin", "Metformin", "Cetirizine", "Ibuprofen", "Omeprazole"];
const CACHE_KEY = "telehealth_medicine_search_cache";

const MedicineSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  // ── Load last cached search on mount ────────────────────
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setResults(parsed.results);
        setLastQuery(parsed.query);
        setFromCache(true);
      } catch { /* ignore */ }
    }
  }, []);

  const handleSearch = async (searchTerm = query) => {
    const term = searchTerm.trim();
    if (!term) return;

    setLoading(true);
    setError("");
    setFromCache(false);

    try {
      const res = await medicineAPI.search(term, inStockOnly);
      const data = res.data;
      setResults(data.results);
      setLastQuery(term);

      // Cache the results for offline use
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        query: term, results: data.results, timestamp: Date.now(),
      }));
    } catch (err) {
      // If network fails, try showing cached results
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setResults(parsed.results);
        setLastQuery(parsed.query);
        setFromCache(true);
        setError("Offline — showing last cached results.");
      } else {
        setError(err.response?.data?.message || "Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const available = results?.available || [];
  const outOfStock = results?.outOfStock || [];

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="ms-page">
        <div className="ms-inner">

          <button className="ms-back" onClick={() => navigate("/patient-dashboard")}>
            ← Back to Dashboard
          </button>
          <h1 className="ms-title">Find Medicines</h1>
          <p className="ms-subtitle">Search which pharmacies near you have a medicine in stock</p>

          {/* Search card */}
          <div className="ms-search-card">
            <div className="ms-search-row">
              <input
                className="ms-search-input"
                placeholder="Search medicine name (e.g. Paracetamol)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="ms-search-btn"
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
              >
                {loading ? "…" : "Search"}
              </button>
            </div>

            <div className="ms-filters">
              <button
                className={`ms-filter-btn${inStockOnly ? " active" : ""}`}
                onClick={() => setInStockOnly((v) => !v)}
              >
                {inStockOnly ? "✓ " : ""}In Stock Only
              </button>
            </div>

            <div style={{ marginTop: "14px" }}>
              <p className="ms-quick-label">Quick searches:</p>
              <div className="ms-quick-chips">
                {QUICK_SEARCHES.map((s) => (
                  <button
                    key={s} className="ms-quick-chip"
                    onClick={() => { setQuery(s); handleSearch(s); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", padding: "11px 14px", fontSize: "13px", color: "#b91c1c", marginBottom: "14px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && <div className="ms-loading">Searching pharmacies…</div>}

          {/* Results */}
          {!loading && results && (
            <>
              <div className="ms-results-header">
                <span className="ms-results-title">
                  Results for "{lastQuery}"
                  {fromCache && <span className="ms-cached-badge">📵 Cached</span>}
                </span>
                <span className="ms-results-count">
                  {available.length + outOfStock.length} pharmacies found
                </span>
              </div>

              {available.length === 0 && outOfStock.length === 0 ? (
                <div className="ms-empty">
                  <div className="ms-empty-icon">💊</div>
                  <p className="ms-empty-title">No pharmacies found</p>
                  <p className="ms-empty-desc">Try a different medicine name or check spelling.</p>
                </div>
              ) : (
                <>
                  {available.length > 0 && (
                    <>
                      <p className="ms-section-label">
                        <span className="ms-dot-in" />
                        Available ({available.length})
                      </p>
                      <div className="ms-grid">
                        {available.map((m, i) => <MedicineCard key={i} medicine={m} />)}
                      </div>
                    </>
                  )}
                  {outOfStock.length > 0 && (
                    <>
                      <p className="ms-section-label">
                        <span className="ms-dot-out" />
                        Out of Stock ({outOfStock.length})
                      </p>
                      <div className="ms-grid">
                        {outOfStock.map((m, i) => <MedicineCard key={i} medicine={m} />)}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Initial state */}
          {!loading && !results && !error && (
            <div className="ms-empty">
              <div className="ms-empty-icon">🔍</div>
              <p className="ms-empty-title">Search for a medicine</p>
              <p className="ms-empty-desc">Type a medicine name above to see which nearby pharmacies have it in stock.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default MedicineSearch;