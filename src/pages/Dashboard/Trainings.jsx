import { useEffect, useState } from "react";
import axios from "axios";
import "./Training.css";

const formatTime = (t) => {
  if (!t) return "—";
  const m = String(t).match(/(\d{2}:\d{2})/);
  return m ? m[1] : "—";
};

function Training() {
  const [trainings, setTrainings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
      const res = await axios.get("http://localhost:5000/api/training");
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
        await axios.put(`http://localhost:5000/api/training/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/training", formData);
      }
      resetForm();
      fetchTrainings();
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/training/${id}`);
      fetchTrainings();
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
    <div className="trn-page">

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
                </div>
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
  );
}

export default Training;