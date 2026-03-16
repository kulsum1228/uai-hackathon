// ============================================================
// components/MedicineCard.jsx — Displays a single medicine result
// ============================================================

const CSS = `
  .mc-card {
    background: #fff;
    border: 1px solid #d8e8d8;
    border-radius: 10px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: box-shadow 0.15s, transform 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .mc-card:hover {
    box-shadow: 0 4px 14px rgba(0,60,30,0.09);
    transform: translateY(-1px);
  }
  .mc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .mc-name { font-size: 15px; font-weight: 600; color: #1a3a2a; }
  .mc-pharmacy { font-size: 12px; color: #7a9a8a; margin-top: 2px; }

  .mc-stock-badge {
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .mc-stock-in { background: #dcfce7; color: #15803d; }
  .mc-stock-out { background: #fee2e2; color: #dc2626; }
  .mc-stock-low { background: #fef9c3; color: #a16207; }

  .mc-details { display: flex; flex-wrap: wrap; gap: 8px; }
  .mc-detail {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; color: #4a6a5a;
    background: #f4f7f4; border-radius: 6px; padding: 4px 10px;
  }
  .mc-detail-icon { font-size: 13px; }

  .mc-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 8px; border-top: 1px solid #e8f0e8;
  }
  .mc-price { font-size: 16px; font-weight: 600; color: #2d7a4f; }
  .mc-price-label { font-size: 11px; color: #7a9a8a; }
  .mc-rx {
    font-size: 11px; background: #fff3e0; color: #e65100;
    border-radius: 4px; padding: 2px 8px; font-weight: 500;
  }
`;

const MedicineCard = ({ medicine }) => {
  const { name, pharmacyName, location, stock, price, requiresPrescription, category } = medicine;

  const stockStatus = stock === 0 ? "out" : stock <= 10 ? "low" : "in";
  const stockLabel = stock === 0 ? "Out of Stock" : stock <= 10 ? `Low Stock (${stock})` : `In Stock (${stock})`;
  const stockClass = { in: "mc-stock-in", out: "mc-stock-out", low: "mc-stock-low" };

  return (
    <>
      <style>{CSS}</style>
      <div className="mc-card">
        <div className="mc-header">
          <div>
            <p className="mc-name">💊 {name}</p>
            <p className="mc-pharmacy">{pharmacyName}</p>
          </div>
          <span className={`mc-stock-badge ${stockClass[stockStatus]}`}>{stockLabel}</span>
        </div>

        <div className="mc-details">
          <span className="mc-detail"><span className="mc-detail-icon">📍</span>{location}</span>
          {category && category !== "other" && (
            <span className="mc-detail"><span className="mc-detail-icon">🏷️</span>{category}</span>
          )}
        </div>

        <div className="mc-footer">
          <div>
            <p className="mc-price">₹{price}</p>
            <p className="mc-price-label">per unit</p>
          </div>
          {requiresPrescription && (
            <span className="mc-rx">Rx Required</span>
          )}
        </div>
      </div>
    </>
  );
};

export default MedicineCard;