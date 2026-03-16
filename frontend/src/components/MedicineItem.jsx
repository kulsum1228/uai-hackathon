// ============================================================
// components/MedicineItem.jsx
// Single medicine card with inline stock update capability
// ============================================================

import { useState } from "react";
import { medicineAPI } from "../services/api";

const CSS = `
  .mi-card {
    background: #fff;
    border: 1px solid #e0d0f0;
    border-radius: 10px;
    padding: 16px;
    font-family: 'DM Sans', sans-serif;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .mi-card:hover {
    box-shadow: 0 4px 14px rgba(100,0,200,0.08);
    transform: translateY(-1px);
  }

  /* Header row */
  .mi-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 8px; margin-bottom: 10px;
  }
  .mi-name { font-size: 14px; font-weight: 600; color: #2d0a4e; margin-bottom: 3px; }
  .mi-category {
    font-size: 11px; background: #f0e8ff; color: #6d28d9;
    border-radius: 4px; padding: 1px 7px; display: inline-block;
  }
  .mi-stock-badge {
    font-size: 11px; font-weight: 600; border-radius: 20px;
    padding: 3px 10px; flex-shrink: 0;
  }
  .mi-in-stock  { background: #dcfce7; color: #15803d; }
  .mi-low-stock { background: #fef9c3; color: #a16207; }
  .mi-out-stock { background: #fee2e2; color: #dc2626; }

  /* Details */
  .mi-details {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; margin-bottom: 12px;
  }
  .mi-detail-label { font-size: 10px; color: #8a6aaa; margin-bottom: 1px; }
  .mi-detail-value { font-size: 13px; font-weight: 500; color: #2d0a4e; }

  .mi-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 10px; border-top: 1px solid #f0e8ff; gap: 8px;
  }
  .mi-updated { font-size: 10px; color: #a090b8; }

  /* Update stock UI */
  .mi-update-row { display: flex; gap: 6px; align-items: center; }
  .mi-stock-input {
    width: 70px; border: 1px solid #d8c8f0; border-radius: 6px;
    padding: 6px 8px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #2d0a4e; background: #faf8ff; outline: none; text-align: center;
  }
  .mi-stock-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.1); }

  .mi-btn-update {
    background: #7c3aed; color: #fff; border: none; border-radius: 6px;
    padding: 6px 12px; font-size: 12px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s;
  }
  .mi-btn-update:hover:not(:disabled) { background: #6d28d9; }
  .mi-btn-update:disabled { background: #c4b5e8; cursor: not-allowed; }

  .mi-btn-open {
    background: #f0e8ff; color: #6d28d9; border: 1px solid #d8c8f0;
    border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .mi-btn-cancel {
    background: none; border: none; color: #a090b8; font-size: 12px;
    cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 6px 4px;
  }

  .mi-rx-badge {
    font-size: 10px; background: #fff3e0; color: #e65100;
    border-radius: 4px; padding: 1px 7px; margin-top: 2px; display: inline-block;
  }

  .mi-saved-flash {
    font-size: 11px; color: #15803d; display: flex; align-items: center; gap: 3px;
  }
`;

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const MedicineItem = ({ medicine, onUpdated }) => {
  const [editing, setEditing]   = useState(false);
  const [stockVal, setStockVal] = useState(medicine.stock);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const stockStatus = medicine.stock === 0 ? "out"
    : medicine.stock <= 10 ? "low" : "in";
  const badgeClass  = { in: "mi-in-stock", low: "mi-low-stock", out: "mi-out-stock" };
  const badgeLabel  = medicine.stock === 0 ? "Out of Stock"
    : medicine.stock <= 10 ? `Low (${medicine.stock})` : `${medicine.stock} units`;

  const handleSave = async () => {
    if (stockVal === "" || Number(stockVal) < 0) return;
    setSaving(true);
    try {
      await medicineAPI.update(medicine._id, { stock: Number(stockVal) });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
      onUpdated?.({ ...medicine, stock: Number(stockVal) });
    } catch {
      // keep editing open on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="mi-card">

        {/* Header */}
        <div className="mi-header">
          <div>
            <p className="mi-name">💊 {medicine.name}</p>
            <span className="mi-category">{medicine.category || "other"}</span>
            {medicine.requiresPrescription && (
              <span className="mi-rx-badge"> Rx</span>
            )}
          </div>
          <span className={`mi-stock-badge ${badgeClass[stockStatus]}`}>
            {badgeLabel}
          </span>
        </div>

        {/* Details grid */}
        <div className="mi-details">
          <div>
            <p className="mi-detail-label">Price</p>
            <p className="mi-detail-value">₹{medicine.price}</p>
          </div>
          <div>
            <p className="mi-detail-label">Stock</p>
            <p className="mi-detail-value">{medicine.stock} units</p>
          </div>
          <div>
            <p className="mi-detail-label">Location</p>
            <p className="mi-detail-value" style={{ fontSize: "12px" }}>
              {medicine.location || "—"}
            </p>
          </div>
          {medicine.manufacturer && (
            <div>
              <p className="mi-detail-label">Manufacturer</p>
              <p className="mi-detail-value" style={{ fontSize: "12px" }}>
                {medicine.manufacturer}
              </p>
            </div>
          )}
        </div>

        {/* Footer: last updated + update stock control */}
        <div className="mi-footer">
          <span className="mi-updated">
            Updated {timeAgo(medicine.updatedAt || medicine.createdAt)}
          </span>

          {saved && (
            <span className="mi-saved-flash">✓ Saved</span>
          )}

          {!editing && !saved && (
            <button className="mi-btn-open" onClick={() => { setEditing(true); setStockVal(medicine.stock); }}>
              Update Stock
            </button>
          )}

          {editing && (
            <div className="mi-update-row">
              <input
                className="mi-stock-input"
                type="number" min="0"
                value={stockVal}
                onChange={(e) => setStockVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
              <button className="mi-btn-update" onClick={handleSave} disabled={saving}>
                {saving ? "…" : "Save"}
              </button>
              <button className="mi-btn-cancel" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default MedicineItem;