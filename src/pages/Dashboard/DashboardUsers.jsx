import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import "./Dashboard.css";

const ROLES = ["Trajner", "Menaxher", "Admin", "Lojtari"];

const ROLE_COLOR = {
  Admin:    { bg: "#7f1d1d", color: "#fca5a5" },
  Trajner:  { bg: "#1e3a5f", color: "#60a5fa" },
  Menaxher: { bg: "#1a3a1a", color: "#4ade80" },
  user:     { bg: "#2a2a2a", color: "#888"    },
};

const emptyForm = {
  username: "", emri: "", mbiemri: "", email: "", password: "", role: "Trajner",
};

const inp = {
  background: "#1a1a1a", border: "1px solid #333", color: "#fff",
  borderRadius: 8, padding: "8px 12px", width: "100%", fontSize: 13,
};

const btnEdit = {
  background: "transparent", color: "#fbbf24", border: "1px solid #fbbf24",
  borderRadius: 5, padding: "3px 12px", fontSize: 12, cursor: "pointer",
};

const btnDel = {
  background: "transparent", color: "#f87171", border: "1px solid #f87171",
  borderRadius: 5, padding: "3px 12px", fontSize: 12, cursor: "pointer",
};

export default function DashboardUsers() {
  const [users,  setUsers]  = useState([]);
  const [msg,    setMsg]    = useState("");
  const [show,   setShow]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [delId,  setDelId]  = useState(null);

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    if (msg) { const t = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(t); }
  }, [msg]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch { setMsg("Gabim gjatë ngarkimit!"); }
  };

  const handleChange = (e) => {
    setErrors({});
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username është i detyrueshëm";
    if (!form.emri.trim())     e.emri     = "Emri është i detyrueshëm";
    if (!form.mbiemri.trim())  e.mbiemri  = "Mbiemri është i detyrueshëm";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email i pavlefshëm";
    if (!editId && form.password.length < 6)
      e.password = "Fjalëkalimi duhet të ketë së paku 6 karaktere";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    try {
      if (editId) {
        await api.put(`/api/admin/users/${editId}`, form);
        setMsg("Të dhënat u ndryshuan!");
      } else {
        await api.post("/api/admin/users", form);
        setMsg("Useri u shtua!");
      }
      setShow(false); setEditId(null); setForm({ ...emptyForm });
      fetchUsers();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Gabim!" });
    }
  };

  const openAdd = () => {
    setEditId(null); setForm({ ...emptyForm }); setErrors({}); setShow(true);
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ username: u.username, emri: u.emri, mbiemri: u.mbiemri, email: u.email, password: "", role: u.role });
    setErrors({}); setShow(true);
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/api/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      setMsg("Roli u ndryshua!");
    } catch (err) { setMsg(err.response?.data?.message || "Gabim!"); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/users/${delId}`);
      setUsers(prev => prev.filter(u => u.id !== delId));
      setMsg("Useri u fshi!");
    } catch (err) { setMsg(err.response?.data?.message || "Gabim!"); }
    setDelId(null);
  };

  const staff  = users.filter(u => u.role !== "user");
  const fans   = users.filter(u => u.role === "user");

  const TableHead = ({ showRole }) => (
    <thead>
      <tr style={{ fontSize: 11, textTransform: "uppercase", color: "#888" }}>
        <th>#</th>
        <th>Emri</th>
        <th>Username</th>
        <th>Email</th>
        {showRole && <th>Roli</th>}
        <th>Veprime</th>
      </tr>
    </thead>
  );

  const StaffRow = ({ u }) => (
    <tr key={u.id}>
      <td style={{ color: "#666" }}>{u.id}</td>
      <td style={{ fontWeight: 600 }}>
        {u.emri} {u.mbiemri}
        {u.id === currentUserId && <span style={{ fontSize: 10, color: "#888", marginLeft: 6 }}>(ti)</span>}
      </td>
      <td style={{ color: "#aaa" }}>@{u.username}</td>
      <td style={{ color: "#aaa" }}>{u.email}</td>
      <td>
        {u.id === currentUserId ? (
          <span className="badge" style={{ background: ROLE_COLOR[u.role]?.bg, color: ROLE_COLOR[u.role]?.color }}>
            {u.role}
          </span>
        ) : (
          <select
            value={u.role}
            onChange={e => handleRoleChange(u.id, e.target.value)}
            style={{
              background: ROLE_COLOR[u.role]?.bg || "#2a2a2a",
              color: ROLE_COLOR[u.role]?.color || "#fff",
              border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 12, cursor: "pointer",
            }}
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </td>
      <td style={{ display: "flex", gap: 6 }}>
        <button style={btnEdit} onClick={() => openEdit(u)}>Edito</button>
        {u.id !== currentUserId && (
          <button style={btnDel} onClick={() => setDelId(u.id)}>Fshi</button>
        )}
      </td>
    </tr>
  );

  const FanRow = ({ u }) => (
    <tr key={u.id}>
      <td style={{ color: "#666" }}>{u.id}</td>
      <td style={{ fontWeight: 600 }}>{u.emri} {u.mbiemri}</td>
      <td style={{ color: "#aaa" }}>@{u.username}</td>
      <td style={{ color: "#aaa" }}>{u.email}</td>
      <td style={{ display: "flex", gap: 6 }}>
        <button style={btnEdit} onClick={() => openEdit(u)}>Edito</button>
        <button style={btnDel}  onClick={() => setDelId(u.id)}>Fshi</button>
      </td>
    </tr>
  );

  return (
    <div className="shell">
      <SideBar active="/DashboardUsers" />

      <div className="main">
        <TopBar title="Menaxhimi i Përdoruesve">
          <button onClick={openAdd} style={{
            background: "#DA291C", color: "#fff", border: "none",
            borderRadius: 5, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            + Shto Përdorues
          </button>
        </TopBar>

        <div className="content">
          {msg && (
            <div className={`alert py-2 ${msg.includes("Gabim") ? "alert-danger" : "alert-success"}`}>
              {msg}
            </div>
          )}

          {/* TABELA 1 — STAFI */}
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-title">Stafi i Sistemit</div>
              <span style={{ fontSize: 12, color: "#888" }}>{staff.length} anëtarë</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table table-dark table-hover mb-0" style={{ fontSize: 13 }}>
                <TableHead showRole={true} />
                <tbody>
                  {staff.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">Nuk ka staf</td></tr>
                  ) : staff.map(u => <StaffRow key={u.id} u={u} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABELA 2 — FANSAT */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Përdoruesit e Regjistruar</div>
              <span style={{ fontSize: 12, color: "#888" }}>{fans.length} fansat</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table table-dark table-hover mb-0" style={{ fontSize: 13 }}>
                <TableHead showRole={false} />
                <tbody>
                  {fans.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">Nuk ka përdorues</td></tr>
                  ) : fans.map(u => <FanRow key={u.id} u={u} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SHTO / EDITO */}
      {show && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #333" }}>
                <h5 className="modal-title" style={{ color: "#fff" }}>
                  {editId ? "Edito Përdoruesin" : "Shto Përdorues"}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShow(false)} />
              </div>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Emri *</label>
                    <input name="emri" value={form.emri} onChange={handleChange} style={inp} />
                    {errors.emri && <span style={{ color: "red", fontSize: 11 }}>{errors.emri}</span>}
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Mbiemri *</label>
                    <input name="mbiemri" value={form.mbiemri} onChange={handleChange} style={inp} />
                    {errors.mbiemri && <span style={{ color: "red", fontSize: 11 }}>{errors.mbiemri}</span>}
                  </div>
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: 12 }}>Username *</label>
                  <input name="username" value={form.username} onChange={handleChange} style={inp} autoComplete="off" />
                  {errors.username && <span style={{ color: "red", fontSize: 11 }}>{errors.username}</span>}
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: 12 }}>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} style={inp} />
                  {errors.email && <span style={{ color: "red", fontSize: 11 }}>{errors.email}</span>}
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: 12 }}>
                    Fjalëkalimi {editId ? "(lër bosh për të mos ndryshuar)" : "*"}
                  </label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} style={inp} autoComplete="new-password" />
                  {errors.password && <span style={{ color: "red", fontSize: 11 }}>{errors.password}</span>}
                </div>
                {!editId && (
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Roli *</label>
                    <select name="role" value={form.role} onChange={handleChange} style={inp}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
                {errors.general && <div style={{ color: "red", fontSize: 13 }}>{errors.general}</div>}
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid #333" }}>
                <button onClick={() => setShow(false)} style={{
                  background: "#2a2a2a", color: "#888", border: "1px solid #333",
                  borderRadius: 5, padding: "7px 16px", fontSize: 13, cursor: "pointer",
                }}>
                  Anulo
                </button>
                <button onClick={handleSave} style={{
                  background: "#DA291C", color: "#fff", border: "none",
                  borderRadius: 5, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  {editId ? "Ruaj Ndryshimet" : "Shto Përdoruesin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FSHIRJA */}
      {delId && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #333" }}>
                <h5 className="modal-title" style={{ color: "#fff" }}>Fshi Përdoruesin</h5>
              </div>
              <div className="modal-body" style={{ color: "#888" }}>
                A je i sigurt? Ky veprim nuk mund të kthehet.
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid #333" }}>
                <button onClick={() => setDelId(null)} style={{
                  background: "#2a2a2a", color: "#888", border: "1px solid #333",
                  borderRadius: 5, padding: "7px 16px", fontSize: 13, cursor: "pointer",
                }}>
                  Anulo
                </button>
                <button onClick={handleDelete} style={{
                  background: "#DA291C", color: "#fff", border: "none",
                  borderRadius: 5, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
