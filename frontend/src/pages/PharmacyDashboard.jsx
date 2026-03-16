// ============================================================
// pages/PharmacyDashboard.jsx — Pharmacy main dashboard
// ============================================================

import { useState, useCallback } from "react";
import AddMedicineForm  from "../components/AddMedicineForm";
import MedicineInventory from "../components/MedicineInventory";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .ph-page {
    min-height: calc(100vh - 58px);
    background: #f5f0ff;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .ph-inner { max-width: 960px; margin: 0 auto; }

  .ph-greeting {
    font-family: 'DM Serif Display', serif;
    font-size: 26px; color: #2d0a4e; margin: 0 0 4px;
  }
  .ph-subtitle { font-size: 13px; color: #8a6aaa; margin: 0 0 28px; }

  /* Stats strip */
  .ph-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px; margin-bottom: 32px;
  }
  .ph-stat {
    background: #fff; border: 1px solid #e0d0f0;
    border-radius: 10px; padding: 16px 18px;
    display: flex; align-items: center; gap: 12px;
  }
  .ph-stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .ph-stat-label { font-size: 11px; color: #8a6aaa; margin-bottom: 2px; }
  .ph-stat-value { font-size: 18px; font-weight: 700; color: #2d0a4e; }

  /* Layout: form left, inventory right on wide screens */
  .ph-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 20px;
    align-items: start;
  }

  .ph-section-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: #8a6aaa; margin: 0 0 14px;
  }

  @media (max-width: 768px) {
    .ph-layout { grid-template-columns: 1fr; }
    .ph-stats   { grid-template-columns: 1fr; }
  }
`;

const PharmacyDashboard = () => {
  const user = JSON.parse(localStorage.getItem("telehealth_user") || "{}");

  // refreshKey bumps MedicineInventory to re-fetch after a new medicine is added
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats]           = useState({ total: 0, inStock: 0, outOfStock: 0 });

  const handleMedicineAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Receive stats back from MedicineInventory once it loads
  const handleStatsUpdate = useCallback((s) => {
    setStats(s);
  }, []);

  const now      = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="ph-page">
        <div className="ph-inner">

          <h1 className="ph-greeting">{greeting}, {user.name || "Pharmacy"} 💊</h1>
          <p className="ph-subtitle">
            {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* Stats */}
          <div className="ph-stats">
            <div className="ph-stat">
              <div className="ph-stat-icon" style={{ background: "#f0e8ff" }}>📦</div>
              <div>
                <p className="ph-stat-label">Total Medicines</p>
                <p className="ph-stat-value">{stats.total}</p>
              </div>
            </div>
            <div className="ph-stat">
              <div className="ph-stat-icon" style={{ background: "#e8fff0" }}>✅</div>
              <div>
                <p className="ph-stat-label">In Stock</p>
                <p className="ph-stat-value">{stats.inStock}</p>
              </div>
            </div>
            <div className="ph-stat">
              <div className="ph-stat-icon" style={{ background: "#fff0f0" }}>❌</div>
              <div>
                <p className="ph-stat-label">Out of Stock</p>
                <p className="ph-stat-value">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          {/* Main layout */}
          <div className="ph-layout">

            {/* Left: Add medicine form */}
            <div>
              <p className="ph-section-title">Add New Medicine</p>
              <AddMedicineForm onSuccess={handleMedicineAdded} pharmacyUser={user} />
            </div>

            {/* Right: Inventory */}
            <div>
              <p className="ph-section-title">Your Inventory</p>
              <MedicineInventory
                key={refreshKey}
                pharmacyId={user._id}
                onStatsUpdate={handleStatsUpdate}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyDashboard;