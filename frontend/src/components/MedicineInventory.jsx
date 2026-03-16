// ============================================================
// components/MedicineInventory.jsx
// Fetches and displays all medicines for the logged-in pharmacy
// ============================================================

import { useState, useEffect } from "react";
import { medicineAPI } from "../services/api";
import MedicineItem from "./MedicineItem";

const CSS = `
  .inv-wrapper { font-family: 'DM Sans', sans-serif; }

  /* Filter bar */
  .inv-filters {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .inv-filter-btn {
    padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
    cursor: pointer; border: 1px solid #d8c8f0; background: #faf8ff;
    color: #5a3a7a; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .inv-filter-btn.active {
    background: #7c3aed; color: #fff; border-color: #7c3aed;
  }
  .inv-search {
    flex: 1; min-width: 160px; border: 1px solid #d8c8f0; border-radius: 20px;
    padding: 5px 14px; font-size: 12px; font-family: 'DM Sans', sans-serif;
    color: #2d0a4e; background: #faf8ff; outline: none;
  }
  .inv-search:focus { border-color: #7c3aed; }

  /* Grid */
  .inv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }

  /* States */
  .inv-loading { text-align: center; padding: 40px; color: #8a6aaa; font-size: 14px; }
  .inv-empty {
    background: #fff; border: 1px dashed #d8c8f0; border-radius: 12px;
    padding: 40px 24px; text-align: center; color: #8a6aaa;
  }
  .inv-empty-icon  { font-size: 32px; margin-bottom: 10px; }
  .inv-empty-title { font-size: 14px; font-weight: 500; color: #5a3a7a; margin-bottom: 4px; }
  .inv-empty-desc  { font-size: 12px; }

  .inv-error {
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 8px;
    padding: 12px 14px; font-size: 13px; color: #b91c1c;
  }
  .inv-count {
    font-size: 12px; color: #8a6aaa; margin-bottom: 12px;
  }
`;

const MedicineInventory = ({ pharmacyId, onStatsUpdate }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("all"); // all | inStock | outOfStock
  const [search, setSearch]       = useState("");

  // ── Fetch inventory on mount ─────────────────────────────
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const res = await medicineAPI.getInventory(pharmacyId);
        const list = res.data.inventory || [];
        setMedicines(list);

        // Calculate stats and send back to parent dashboard
        onStatsUpdate?.({
          total:      list.length,
          inStock:    list.filter((m) => m.stock > 0).length,
          outOfStock: list.filter((m) => m.stock === 0).length,
        });
      } catch (err) {
        setError("Failed to load inventory. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    if (pharmacyId) fetchInventory();
  }, [pharmacyId]);

  // ── Handle inline stock update from MedicineItem ─────────
  const handleUpdated = (updated) => {
    setMedicines((prev) =>
      prev.map((m) => (m._id === updated._id ? updated : m))
    );
    // Recalculate stats after update
    const updated_list = medicines.map((m) => (m._id === updated._id ? updated : m));
    onStatsUpdate?.({
      total:      updated_list.length,
      inStock:    updated_list.filter((m) => m.stock > 0).length,
      outOfStock: updated_list.filter((m) => m.stock === 0).length,
    });
  };

  // ── Filter + search ───────────────────────────────────────
  const filtered = medicines
    .filter((m) => {
      if (filter === "inStock")    return m.stock > 0;
      if (filter === "outOfStock") return m.stock === 0;
      return true;
    })
    .filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.category || "").toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <><style>{CSS}</style>
    <div className="inv-loading">Loading your inventory…</div></>
  );

  if (error) return (
    <><style>{CSS}</style>
    <div className="inv-error">⚠️ {error}</div></>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="inv-wrapper">

        {/* Filters + search */}
        {medicines.length > 0 && (
          <div className="inv-filters">
            <input
              className="inv-search"
              placeholder="Search by name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {[
              { key: "all",        label: "All" },
              { key: "inStock",    label: "In Stock" },
              { key: "outOfStock", label: "Out of Stock" },
            ].map((f) => (
              <button
                key={f.key}
                className={`inv-filter-btn ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <p className="inv-count">
            Showing {filtered.length} of {medicines.length} medicines
          </p>
        )}

        {/* Empty state */}
        {medicines.length === 0 ? (
          <div className="inv-empty">
            <div className="inv-empty-icon">📦</div>
            <p className="inv-empty-title">No medicines yet</p>
            <p className="inv-empty-desc">
              Use the form on the left to add your first medicine.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="inv-empty">
            <div className="inv-empty-icon">🔍</div>
            <p className="inv-empty-title">No results found</p>
            <p className="inv-empty-desc">Try a different search term or filter.</p>
          </div>
        ) : (
          <div className="inv-grid">
            {filtered.map((m) => (
              <MedicineItem key={m._id} medicine={m} onUpdated={handleUpdated} />
            ))}
          </div>
        )}

      </div>
    </>
  );
};

export default MedicineInventory;