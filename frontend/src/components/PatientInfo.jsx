// ============================================================
// components/PatientInfo.jsx
// Displays a patient's health record in the consultation room
// ============================================================

const CSS = `
  .pi-card {
    background: #fff; border: 1px solid #d0dce8; border-radius: 12px;
    overflow: hidden; font-family: 'DM Sans', sans-serif;
  }
  .pi-header {
    background: linear-gradient(135deg, #1a3a5c 0%, #1a5276 100%);
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
  }
  .pi-avatar {
    width: 46px; height: 46px; border-radius: 50%;
    background: rgba(255,255,255,0.2); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 600; flex-shrink: 0;
  }
  .pi-name { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 2px; }
  .pi-email { font-size: 12px; color: rgba(255,255,255,0.65); }

  .pi-body { padding: 16px 20px; }

  .pi-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 16px;
  }
  .pi-field-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase; color: #6a7a8a; margin-bottom: 3px;
  }
  .pi-field-value { font-size: 14px; font-weight: 500; color: #0f2a4a; }
  .pi-field-empty { font-size: 13px; color: #a0b0c0; font-style: italic; }

  .pi-divider { height: 1px; background: #e8f0f8; margin: 12px 0; }

  .pi-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
  .pi-tag {
    font-size: 11px; padding: 3px 10px; border-radius: 20px;
    background: #fef9c3; color: #92400e; border: 1px solid #fde68a;
  }
  .pi-tag-med {
    font-size: 11px; padding: 3px 10px; border-radius: 20px;
    background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;
  }
  .pi-tag-disease {
    font-size: 11px; padding: 3px 10px; border-radius: 20px;
    background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;
  }
  .pi-none { font-size: 12px; color: #a0b0c0; font-style: italic; }

  .pi-history {
    font-size: 13px; color: #2a3a4a; line-height: 1.6;
    background: #f4f7fa; border-radius: 7px; padding: 10px 12px;
    margin-top: 4px;
  }

  .pi-loading { padding: 24px; text-align: center; color: #6a7a8a; font-size: 13px; }
  .pi-no-record {
    padding: 24px; text-align: center; color: #6a7a8a; font-size: 13px;
    font-style: italic;
  }
`;

const PatientInfo = ({ patient, healthRecord, loading }) => {
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="pi-card"><div className="pi-loading">Loading patient info…</div></div>
    </>
  );

  if (!patient) return null;

  const initials = patient.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P";

  return (
    <>
      <style>{CSS}</style>
      <div className="pi-card">

        {/* Header with patient name */}
        <div className="pi-header">
          <div className="pi-avatar">{initials}</div>
          <div>
            <p className="pi-name">{patient.name}</p>
            <p className="pi-email">{patient.email}</p>
          </div>
        </div>

        <div className="pi-body">
          {!healthRecord ? (
            <p className="pi-no-record">No health record on file for this patient.</p>
          ) : (
            <>
              {/* Basic vitals */}
              <div className="pi-grid">
                <div>
                  <p className="pi-field-label">Age</p>
                  {healthRecord.age
                    ? <p className="pi-field-value">{healthRecord.age} yrs</p>
                    : <p className="pi-field-empty">Not set</p>}
                </div>
                <div>
                  <p className="pi-field-label">Blood Group</p>
                  {healthRecord.bloodGroup && healthRecord.bloodGroup !== "unknown"
                    ? <p className="pi-field-value">{healthRecord.bloodGroup}</p>
                    : <p className="pi-field-empty">Unknown</p>}
                </div>
                <div>
                  <p className="pi-field-label">Height</p>
                  {healthRecord.height
                    ? <p className="pi-field-value">{healthRecord.height} cm</p>
                    : <p className="pi-field-empty">Not set</p>}
                </div>
                <div>
                  <p className="pi-field-label">Weight</p>
                  {healthRecord.weight
                    ? <p className="pi-field-value">{healthRecord.weight} kg</p>
                    : <p className="pi-field-empty">Not set</p>}
                </div>
              </div>

              <div className="pi-divider" />

              {/* Allergies */}
              <div style={{ marginBottom: "12px" }}>
                <p className="pi-field-label">Allergies</p>
                {healthRecord.allergies?.length > 0 ? (
                  <div className="pi-tags">
                    {healthRecord.allergies.map((a) => (
                      <span className="pi-tag" key={a}>⚠️ {a}</span>
                    ))}
                  </div>
                ) : <p className="pi-none">None reported</p>}
              </div>

              {/* Chronic diseases */}
              <div style={{ marginBottom: "12px" }}>
                <p className="pi-field-label">Chronic Conditions</p>
                {healthRecord.chronicDiseases?.length > 0 ? (
                  <div className="pi-tags">
                    {healthRecord.chronicDiseases.map((d) => (
                      <span className="pi-tag-disease" key={d}>{d}</span>
                    ))}
                  </div>
                ) : <p className="pi-none">None reported</p>}
              </div>

              {/* Current medications */}
              <div style={{ marginBottom: "12px" }}>
                <p className="pi-field-label">Current Medications</p>
                {healthRecord.currentMedications?.length > 0 ? (
                  <div className="pi-tags">
                    {healthRecord.currentMedications.map((m) => (
                      <span className="pi-tag-med" key={m}>💊 {m}</span>
                    ))}
                  </div>
                ) : <p className="pi-none">None reported</p>}
              </div>

              {/* Medical history */}
              {healthRecord.medicalHistory && (
                <div>
                  <p className="pi-field-label">Medical History</p>
                  <div className="pi-history">{healthRecord.medicalHistory}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientInfo;