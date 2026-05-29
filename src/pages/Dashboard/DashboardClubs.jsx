import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import "./DashboardClubs.css";
import SideBar from "../../Components/SideBar";
import "./Dashboard.css";   
import "bootstrap/dist/css/bootstrap.min.css";  
import "bootstrap-icons/font/bootstrap-icons.css";

const emptyForm = {
  emertimi: "",
  qyteti: "",
  stadiumi: "",
  viti_themelimit: "",
  logo: "",
  presidenti: "",
  buxheti: "",
};

const formatBuxheti = (val) => {
  if (!val) return "—";
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(val);
};

function DashboardClubs() {
  const [clubs,     setClubs]     = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData,  setFormData]  = useState({ ...emptyForm });
  const [search,    setSearch]    = useState("");

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get("/api/clubs");
      setClubs(res.data);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        viti_themelimit: formData.viti_themelimit ? parseInt(formData.viti_themelimit) : null,
        buxheti: formData.buxheti ? parseFloat(formData.buxheti) : null,
      };
      if (editingId) {
        await api.put(`/api/clubs/${editingId}`, payload);
      } else {
        await api.post("/api/clubs", payload);
      }
      resetForm();
      fetchClubs();
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish këtë klub?")) return;
    try {
      await api.delete(`/api/clubs/${id}`);
      fetchClubs();
    } catch (err) { console.log(err); }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      emertimi:       c.emertimi       || "",
      qyteti:         c.qyteti         || "",
      stadiumi:       c.stadiumi       || "",
      viti_themelimit: c.viti_themelimit || "",
      logo:           c.logo           || "",
      presidenti:     c.presidenti     || "",
      buxheti:        c.buxheti        || "",
    });
    setShowForm(true);
  };

  const filtered = clubs.filter((c) =>
    `${c.emertimi} ${c.qyteti} ${c.presidenti}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shell">
      <SideBar active="/clubs" />

      <div className="main clb-page">

        <div className="clb-topbar">
          <h2>Menaxhimi i Klubeve</h2>
          <div className="clb-topbar-right">
            <input
              className="clb-search"
              type="text"
              placeholder="Kërko klub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="clb-btn-add" onClick={() => setShowForm(true)}>
              + Shto Klub
            </button>
          </div>
        </div>

        <div className="clb-hero">
          <h1 className="clb-title">KLUBET</h1>
        </div>

        {/* Content */}
        <div className="clb-content">
          {filtered.length > 0 ? (
            <div className="clb-cards">
              {filtered.map((c) => (
                <div className="clb-card" key={c.id}>
                  {/* Logo + Emri */}
                  <div className="clb-card-header">
                    <div className="clb-logo">
                      {c.logo ? (
                        <img src={c.logo} alt={c.emertimi} className="clb-logo-img" />
                      ) : (
                        <div className="clb-logo-placeholder">{c.emertimi?.[0]}</div>
                      )}
                    </div>
                    <div>
                      <h3>{c.emertimi}</h3>
                      <p className="clb-city">📍 {c.qyteti}</p>
                    </div>
                  </div>

                  <p className="meta">Stadiumi: <span>{c.stadiumi || "—"}</span></p>
                  <p className="meta">Themeluar: <span>{c.viti_themelimit || "—"}</span></p>
                  <p className="meta">Presidenti: <span>{c.presidenti || "—"}</span></p>
                  <p className="meta">Buxheti: <span>{formatBuxheti(c.buxheti)}</span></p>

                  <div className="clb-card-actions">
                    <button className="clb-btn-edit" onClick={() => handleEdit(c)}>Ndrysho</button>
                    <button className="clb-btn-delete" onClick={() => handleDelete(c.id)}>Fshij</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="clb-empty">
              <p>Nuk ka klube. Shtyp "+ Shto Klub" për të shtuar.</p>
            </div>
          )}
        </div>

        {showForm && (
          <div className="clb-form-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
            <div className="clb-form-card">
              <h3>{editingId ? "Ndrysho Klubin" : "Shto Klub"}</h3>
              <div className="clb-form-grid">
                <div>
                  <label>Emërtimi</label>
                  <input type="text" name="emertimi" placeholder="p.sh. Manchester United" value={formData.emertimi} onChange={handleChange} />
                </div>
                <div>
                  <label>Qyteti</label>
                  <input type="text" name="qyteti" placeholder="p.sh. Manchester" value={formData.qyteti} onChange={handleChange} />
                </div>
                <div>
                  <label>Stadiumi</label>
                  <input type="text" name="stadiumi" placeholder="p.sh. Old Trafford" value={formData.stadiumi} onChange={handleChange} />
                </div>
                <div>
                  <label>Viti Themelimit</label>
                  <input type="number" name="viti_themelimit" placeholder="p.sh. 1878" value={formData.viti_themelimit} onChange={handleChange} />
                </div>
                <div>
                  <label>Presidenti</label>
                  <input type="text" name="presidenti" placeholder="p.sh. Jim Ratcliffe" value={formData.presidenti} onChange={handleChange} />
                </div>
                <div>
                  <label>Buxheti (€)</label>
                  <input type="number" name="buxheti" placeholder="p.sh. 5000000" value={formData.buxheti} onChange={handleChange} />
                </div>
                <div className="clb-full">
                  <label>Logo (URL)</label>
                  <input type="text" name="logo" placeholder="https://..." value={formData.logo} onChange={handleChange} />
                </div>
                {formData.logo && (
                  <div className="clb-full clb-logo-preview-wrap">
                    <img src={formData.logo} alt="preview" className="clb-logo-preview" />
                  </div>
                )}
              </div>
              <div className="clb-form-actions">
                <button className="clb-btn-add" style={{ flex: 1 }} onClick={handleSubmit}>
                  {editingId ? "Ruaj Ndryshimet" : "Shto"}
                </button>
                <button className="clb-btn-cancel" onClick={resetForm}>Anulo</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardClubs;
