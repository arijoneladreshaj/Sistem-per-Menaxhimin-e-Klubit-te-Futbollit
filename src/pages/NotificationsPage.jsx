import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const STATUS_STYLE = {
  "Po vij":       { bg: "#1a3a1a", color: "#4ade80", border: "#4ade80" },
  "Nuk vij":      { bg: "#7f1d1d", color: "#fca5a5", border: "#fca5a5" },
  "Papërcaktuar": { bg: "#1a1a1a", color: "#888",    border: "#333"    },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [tab,        setTab]       = useState("notifs");
  const [notifs,     setNotifs]    = useState([]);
  const [sessions,   setSessions]  = useState([]);
  const [attendance, setAttendance]= useState({});
  const [loading,    setLoading]   = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [nRes, tRes, aRes] = await Promise.all([
        api.get("/api/notifications/my"),
        api.get("/api/training"),
        api.get("/api/training/my-attendance"),
      ]);

      setNotifs(nRes.data);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      setSessions(
        tRes.data
          .filter(s => new Date(s.data_stervitjes) >= today)
          .sort((a, b) => new Date(a.data_stervitjes) - new Date(b.data_stervitjes))
      );

      const map = {};
      aRes.data.forEach(a => { map[a.training_id] = a.statusi; });
      setAttendance(map);
    } catch {}
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const confirm = async (trainingId, statusi) => {
    try {
      await api.post(`/api/training/${trainingId}/attendance`, { statusi });
      setAttendance(prev => ({ ...prev, [trainingId]: statusi }));
    } catch {}
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#141414", borderBottom: "1px solid #2a2a2a", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}
        >
          ←
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Njoftimet</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", marginBottom: 24 }}>
          {[["notifs", "Njoftimet", unread], ["stervitje", "Prezenca", 0]].map(([key, label, badge]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ padding: "10px 20px", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === key ? 700 : 400, color: tab === key ? "#fff" : "#666", borderBottom: tab === key ? "2px solid #DA291C" : "2px solid transparent", display: "flex", alignItems: "center", gap: 6 }}
            >
              {label}
              {badge > 0 && (
                <span style={{ background: "#DA291C", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px" }}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#666" }}>Duke ngarkuar...</p>
        ) : tab === "notifs" ? (
          <>
            {unread > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={markAllRead} style={{ background: "transparent", border: "none", color: "#DA291C", fontSize: 13, cursor: "pointer" }}>
                  Shëno të gjitha si lexuara
                </button>
              </div>
            )}
            {notifs.length === 0 ? (
              <div style={{ textAlign: "center", color: "#666", padding: 40 }}>Nuk ka njoftime</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    style={{ background: n.is_read ? "#141414" : "#1f1a1a", border: `1px solid ${n.is_read ? "#2a2a2a" : "#3a2020"}`, borderRadius: 10, padding: "14px 16px", cursor: n.is_read ? "default" : "pointer" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: n.is_read ? 400 : 600, color: n.is_read ? "#aaa" : "#fff" }}>
                        {n.titulli}
                      </span>
                      {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DA291C", flexShrink: 0, marginTop: 3 }} />}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{n.mesazhi}</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>
                      {new Date(n.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", color: "#666", padding: 40 }}>Nuk ka stërvitje të ardhshme</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.map(s => {
                  const myStatus = attendance[s.id] || "Papërcaktuar";
                  const st = STATUS_STYLE[myStatus];
                  return (
                    <div key={s.id} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10, padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15, textTransform: "capitalize" }}>
                            {new Date(s.data_stervitjes).toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "long" })}
                          </div>
                          <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                            {s.ora_fillimit?.slice(0,5)} – {s.ora_perfundimit?.slice(0,5)}
                            {s.lokacioni && <span style={{ marginLeft: 8 }}>📍 {s.lokacioni}</span>}
                          </div>
                        </div>
                        <div style={{ background: "#DA291C", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                          {s.lloji || "Stërvitje"}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a2a2a" }}>
                        <span style={{ fontSize: 12, color: "#666" }}>Statusi:</span>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: 12, padding: "2px 10px", borderRadius: 4 }}>
                          {myStatus}
                        </span>
                        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                          {myStatus !== "Po vij" && (
                            <button
                              onClick={() => confirm(s.id, "Po vij")}
                              style={{ fontSize: 12, padding: "4px 14px", borderRadius: 6, background: "#1a3a1a", color: "#4ade80", border: "1px solid #4ade80", cursor: "pointer", fontWeight: 600 }}
                            >
                              Po vij
                            </button>
                          )}
                          {myStatus !== "Nuk vij" && (
                            <button
                              onClick={() => confirm(s.id, "Nuk vij")}
                              style={{ fontSize: 12, padding: "4px 14px", borderRadius: 6, background: "#7f1d1d", color: "#fca5a5", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 600 }}
                            >
                              Nuk vij
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
