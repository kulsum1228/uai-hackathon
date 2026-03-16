// ============================================================
// components/AddMedicineForm.jsx
// Form for pharmacy to add a new medicine to their inventory
// ============================================================

import { useState } from "react";
import { medicineAPI } from "../services/api";

const CSS = `
  .amf-card {
    background: #fff;
    border: 1px solid #e0d0f0;
    border-radius: 12px;
    padding: 24px;
    font-family: 'DM Sans', sans-serif;
  }

  .amf-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
  .amf-label {
    font-size: 12px; font-weight: 500; color: #5a3a7a;
    letter-spacing: 0.3px;
  }
  .amf-input, .amf-select {
    border: 1px solid #d8c8f0; border-radius: 7px;
    padding: 10px 12px; font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #2d0a4e; background: #faf8ff; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .amf-input:focus, .amf-select:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
    background: #fff;
  }

  /* Two-column row for price + stock */
  .amf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .amf-submit-btn {
    width: 100%; background: #7c3aed; color: #fff; border: none;
    border-radius: 7px; padding: 12px; font-size: 14px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s; margin-top: 4px;
  }
  .amf-submit-btn:hover:not(:disabled) { background: #6d28d9; }
  .amf-submit-btn:disabled { background: #c4b5e8; cursor: not-allowed; }

  .amf-alert {
    border-radius: 8px; padding: 10px 14px; font-size: 13px;
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .amf-success { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; }
  .amf-error   { background: #fff5f5; border: 1px solid #fca5a5; color: #b91c1c; }

  /* Rx toggle */
  .amf-toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    background: #faf8ff; border: 1px solid #e8d8ff;
    border-radius: 7px; padding: 10px 12px; margin-bottom: 14px;
    cursor: pointer;
  }
  .amf-toggle-label { font-size: 13px; color: #5a3a7a; }
  .amf-toggle {
    width: 36px; height: 20px; border-radius: 10px;
    position: relative; transition: background 0.2s; flex-shrink: 0;
  }
  .amf-toggle.on  { background: #7c3aed; }
  .amf-toggle.off { background: #d0c0e8; }
  .amf-toggle-knob {
    position: absolute; top: 2px; width: 16px; height: 16px;
    border-radius: 50%; background: #fff;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .amf-toggle.on  .amf-toggle-knob { left: 18px; }
  .amf-toggle.off .amf-toggle-knob { left: 2px;  }
`;

const CATEGORIES = [
  "other", "antibiotic", "analgesic", "antiviral", "antifungal",
  "antacid", "antihistamine", "antidiabetic", "antihypertensive", "vitamin", "vaccine",
];

const EMPTY_FORM = {
  name: "", price: "", stock: "", location: "",
  category: "other", manufacturer: "", requiresPrescription: false,
};

const AddMedicineForm = ({ onSuccess, pharmacyUser }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleRx = () =>
    setForm((p) => ({ ...p, requiresPrescription: !p.requiresPrescription }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Basic validation
    if (!form.name.trim() || !form.price || !form.stock || !form.location.trim()) {
      setAlert({ type: "error", msg: "Name, price, stock, and location are required." });
      return;
    }
    if (Number(form.price) < 0 || Number(form.stock) < 0) {
      setAlert({ type: "error", msg: "Price and stock cannot be negative." });
      return;
    }

    setLoading(true);
    try {
      await medicineAPI.add({
        name:                 form.name.trim(),
        price:                Number(form.price),
        stock:                Number(form.stock),
        location:             form.location.trim(),
        category:             form.category,
        manufacturer:         form.manufacturer.trim(),
        requiresPrescription: form.requiresPrescription,
      });

      setAlert({ type: "success", msg: `"${form.name}" added to inventory successfully!` });
      setForm(EMPTY_FORM);   // Clear the form
      onSuccess?.();         // Tell parent to refresh inventory
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Failed to add medicine. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="amf-card">

        {alert && (
          <div className={`amf-alert amf-${alert.type}`}>
            {alert.type === "success" ? "✓" : "⚠️"} {alert.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Medicine name */}
          <div className="amf-field">
            <label className="amf-label">Medicine Name *</label>
            <input
              className="amf-input" name="name"
              placeholder="e.g. Paracetamol 500mg"
              value={form.name} onChange={handleChange}
            />
          </div>

          {/* Price + Stock */}
          <div className="amf-row">
            <div className="amf-field">
              <label className="amf-label">Price (₹) *</label>
              <input
                className="amf-input" type="number" name="price"
                placeholder="e.g. 25" min="0" step="0.01"
                value={form.price} onChange={handleChange}
              />
            </div>
            <div className="amf-field">
              <label className="amf-label">Stock Qty *</label>
              <input
                className="amf-input" type="number" name="stock"
                placeholder="e.g. 100" min="0"
                value={form.stock} onChange={handleChange}
              />
            </div>
          </div>

          {/* Location */}
          <div className="amf-field">
            <label className="amf-label">Pharmacy Location *</label>
            <input
              className="amf-input" name="location"
              placeholder="e.g. Sector 5, Navi Mumbai"
              value={form.location} onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div className="amf-field">
            <label className="amf-label">Category</label>
            <select className="amf-select" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Manufacturer */}
          <div className="amf-field">
            <label className="amf-label">Manufacturer (optional)</label>
            <input
              className="amf-input" name="manufacturer"
              placeholder="e.g. Cipla, Sun Pharma"
              value={form.manufacturer} onChange={handleChange}
            />
          </div>

          {/* Prescription toggle */}
          <div className="amf-toggle-row" onClick={toggleRx}>
            <span className="amf-toggle-label">Requires Prescription (Rx)</span>
            <div className={`amf-toggle ${form.requiresPrescription ? "on" : "off"}`}>
              <div className="amf-toggle-knob" />
            </div>
          </div>

          <button className="amf-submit-btn" type="submit" disabled={loading}>
            {loading ? "Adding medicine…" : "+ Add to Inventory"}
          </button>

        </form>
      </div>
    </>
  );
};

export default AddMedicineForm;