import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import "./Training.css";
import "./Dashboard.css";
import SideBar from "../../Components/SideBar";

const formatTime = (t) => {
  if (!t) return "—";
  const m = String(t).match(/(\d{2}:\d{2})/);
  return m ? m[1] : "—";
};

const STATUS_COLOR = {
  "Po vij":       { bg: "#1a3a1a", color: "#4ade80" },
  "Nuk vij":      { bg: "#7f1d1d", color: "#fca5a5" },
  "Papërcaktuar": { bg: "#2a2a2a", color: "#888"    },
};

function Training() {
  const [trainings,   setTrainings]   = useState([]);
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [attendance,  setAttendance]  = useState({});
  const [openAtt,     setOpenAtt]     = useState(null);
  const [formData, setFormData] = useState({
    club_id: 1,
    data_stervitjes: "",
    ora_fillimit: "",
    ora_perfundimit: "",
    lloji: "",
    pershkrimi: "",
    lokacioni: "",
  });

  useEffect(() => { fetchTrainings(); }, []);

  const fetchTrainings = async () => {
    try {
      const res = await api.get("/api/training");
      setTrainings(res.data);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({ club_id: 1, data_stervitjes: "", ora_fillimit: "", ora_perfundimit: "", lloji: "", pershkrimi: "", lokacioni: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/api/training/${editingId}`, formData);
      } else {
        await api.post("/api/training", formData);
      }
      resetForm();
      fetchTrainings();
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/training/${id}`);
      fetchTrainings();
    } catch (err) { console.log(err); }
  };

  const toggleAttendance = async (id) => {
    if (openAtt === id) { setOpenAtt(null); return; }
    try {
      const res = await api.get(`/api/training/${id}/attendance`);
      setAttendance(prev => ({ ...prev, [id]: res.data }));
      setOpenAtt(id);
    } catch (err) { console.log(err); }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      club_id: t.club_id,
      data_stervitjes: t.data_stervitjes?.split("T")[0],
      ora_fillimit: formatTime(t.ora_fillimit) === "—" ? "" : formatTime(t.ora_fillimit),
      ora_perfundimit: formatTime(t.ora_perfundimit) === "—" ? "" : formatTime(t.ora_perfundimit),
      lloji: t.lloji,
      pershkrimi: t.pershkrimi,
      lokacioni: t.lokacioni,
    });
    setShowForm(true);
  };

  return (
    <div className="shell">
      <SideBar active="/training" />

      <div className="main trn-page">

      {/* Top Bar */}
      <div className="trn-topbar">
        <h2>Menaxhimi i Stërvitjeve</h2>
        <div className="trn-topbar-right">
          <button className="trn-btn-add" onClick={() => setShowForm(true)}>
            + Shto Stërvitje
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="trn-hero">
        <div className="trn-season">SEZONI 2025/26</div>
        <h1 className="trn-title">STËRVITJET</h1>
      </div>

      {/* Content */}
      <div className="trn-content">
        {trainings.length > 0 ? (
          <div className="trn-cards">
            {trainings.map((t) => (
              <div className="trn-card" key={t.id}>
                <h3>{t.lloji}</h3>
                {t.pershkrimi && <p className="desc">{t.pershkrimi}</p>}
                <p className="meta">Lokacioni: <span>{t.lokacioni || "—"}</span></p>
                <p className="meta">Data: <span>{t.data_stervitjes?.split("T")[0] || "—"}</span></p>
                <p className="meta">Ora: <span>{formatTime(t.ora_fillimit)} – {formatTime(t.ora_perfundimit)}</span></p>
                <div className="trn-card-actions">
                  <button className="trn-btn-edit" onClick={() => handleEdit(t)}>Ndrysho</button>
                  <button className="trn-btn-delete" onClick={() => handleDelete(t.id)}>Fshij</button>
                  <button className="trn-btn-edit" onClick={() => toggleAttendance(t.id)} style={{ marginLeft: "auto" }}>
                    {openAtt === t.id ? "Mbyll" : "Prezenca"}
                  </button>
                </div>

                {openAtt === t.id && (
                  <div style={{ marginTop: 12, borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
                    {!attendance[t.id] || attendance[t.id].length === 0 ? (
                      <p style={{ color: "#666", fontSize: 12, margin: 0 }}>Nuk ka lojtarë të regjistruar</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {attendance[t.id].map(a => {
                          const s = STATUS_COLOR[a.statusi] || STATUS_COLOR["Papërcaktuar"];
                          return (
                            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                              <span style={{ color: "#ccc" }}>{a.emri} {a.mbiemri}</span>
                              <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>
                                {a.statusi}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="trn-empty">
            <p>Nuk ka stërvitje. Shtyp "+ Shto Stërvitje" për të shtuar.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="trn-form-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="trn-form-card">
            <h3>{editingId ? "Ndrysho Stërvitjen" : "Shto Stërvitje"}</h3>
            <div className="trn-form-grid">
              <div>
                <label>Data</label>
                <input type="date" name="data_stervitjes" value={formData.data_stervitjes} onChange={handleChange} />
              </div>
              <div>
                <label>Lloji</label>
                <input type="text" name="lloji" placeholder="p.sh. Fizik, Taktik..." value={formData.lloji} onChange={handleChange} />
              </div>
              <div>
                <label>Ora Fillimit</label>
                <input type="time" name="ora_fillimit" value={formData.ora_fillimit} onChange={handleChange} />
              </div>
              <div>
                <label>Ora Përfundimit</label>
                <input type="time" name="ora_perfundimit" value={formData.ora_perfundimit} onChange={handleChange} />
              </div>
              <div className="trn-full">
                <label>Lokacioni</label>
                <input type="text" name="lokacioni" placeholder="p.sh. Fusha kryesore" value={formData.lokacioni} onChange={handleChange} />
              </div>
              <div className="trn-full">
                <label>Përshkrimi</label>
                <textarea name="pershkrimi" placeholder="Përshkruaj stërvitjen..." value={formData.pershkrimi} onChange={handleChange} />
              </div>
            </div>
            <div className="trn-form-actions">
              <button className="trn-btn-add" style={{ flex: 1 }} onClick={handleSubmit}>
                {editingId ? "Ruaj Ndryshimet" : "Shto"}
              </button>
              <button className="trn-btn-cancel" onClick={resetForm}>Anulo</button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

export default Training;