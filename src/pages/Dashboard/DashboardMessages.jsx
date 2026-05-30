import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

export default function DashboardMessages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchMessages = () =>
    api.get("/api/contact").then(r => setMessages(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    await api.put(`/api/contact/${id}/lexuar`).catch(() => {});
    fetchMessages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish këtë mesazh?")) return;
    await api.delete(`/api/contact/${id}`).catch(() => {});
    if (selected?.id === id) setSelected(null);
    fetchMessages();
  };

  const unread = messages.filter(m => !m.lexuar).length;

  const fmtDate = (d) => new Date(d).toLocaleString("sq-AL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="shell">
      <SideBar active="/messages" />
      <div className="main">
        <TopBar title="Mesazhet e Kontaktit" />
        <div style={{ padding: "32px 36px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2, color: "#fff", margin: 0 }}>MESAZHET</h2>
            {unread > 0 && (
              <span style={{ background: "#DA291C", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                {unread} të palexuara
              </span>
            )}
          </div>

          {messages.length === 0 ? (
            <div style={{ color: "#555", fontSize: 14, textAlign: "center", padding: "60px 0" }}>Nuk ka mesazhe akoma.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, alignItems: "start" }}>

              {/* Lista */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map(m => (
                  <div key={m.id}
                    style={{ background: selected?.id === m.id ? "rgba(218,41,28,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected?.id === m.id ? "#DA291C" : "rgba(255,255,255,0.07)"}`, borderLeft: `3px solid ${m.lexuar ? "rgba(255,255,255,0.1)" : "#DA291C"}`, padding: "14px 18px", cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => { setSelected(m); if (!m.lexuar) markRead(m.id); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: m.lexuar ? "#aaa" : "#fff" }}>{m.emri}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 10, color: "#555" }}>{fmtDate(m.created_at)}</span>
                        <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                          style={{ background: "rgba(239,68,68,0.12)", border: "none", color: "#ef4444", fontSize: 11, padding: "2px 8px", borderRadius: 3, cursor: "pointer" }}>
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>{m.email}</div>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.mesazhi}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detaji */}
              {selected ? (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "28px 32px", position: "sticky", top: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#fff" }}>{selected.emri}</div>
                      <div style={{ fontSize: 13, color: "#DA291C", marginTop: 2 }}>{selected.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#555" }}>{fmtDate(selected.created_at)}</div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                    <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{selected.mesazhi}</p>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#444", fontSize: 13, textAlign: "center", padding: "60px 0" }}>Zgjidh një mesazh për ta parë.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
