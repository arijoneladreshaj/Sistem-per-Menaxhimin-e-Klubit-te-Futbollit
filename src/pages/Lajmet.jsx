import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManchesterUnitedHome.css";
import "./Lajmet.css";
import { Modal, Form, Button } from "react-bootstrap";
import api from "../api/axiosInstance";
import Navbar from "../Components/NavBar";

const API = "/api/lajme";

const LAJMET_DATA = [
  { id:"s1", kategoria:"TRANSFERIME", titulli:"Man United konfirmon transferimin e ri për sezonin e ardhshëm",  pershkrimi:"Klubi ka arritur marrëveshje me lojtarin e ri që do t'i bashkohet skuadrës sezonin e ardhshëm. Negociatat zgjatën disa javë dhe tani gjithçka është zyrtare.", foto:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80", autori:"Redaksia" },
  { id:"s2", kategoria:"NDESHJE",     titulli:"Formacioni i mundshëm kundër Chelsea në Premier League",         pershkrimi:"Trajneri ka folur për formacionin dhe lojtarët e gatshëm para ndeshjes vendimtare të javës.", foto:"https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80", autori:"Redaksia" },
  { id:"s3", kategoria:"KLUBI",       titulli:"Statistikat e gjysmës së sezonit — United renditet i katërt",    pershkrimi:"Pas 19 ndeshjeve, United ka 38 pikë dhe shënuar 41 gola. Mbrojtja ka pësuar 22 gola.", foto:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80", autori:"Redaksia" },
  { id:"s4", kategoria:"AKADEMIA",    titulli:"Talenti i ri 17-vjeçar bën debutimin e parë profesional",        pershkrimi:"Ethan Wheatley shënoi golin e parë në debutimin e tij me ekipin e parë.", foto:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80", autori:"Redaksia" },
  { id:"s5", kategoria:"TRANSFERIME", titulli:"Lojtari i ri mbërrin në Manchester për vizitat mjekësore",       pershkrimi:"Arritja pritet të finalizohet brenda 48 orëve. Kontrata është për tre vjet me opsion zgjatjeje.", foto:"https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80", autori:"Redaksia" },
  { id:"s6", kategoria:"NDESHJE",     titulli:"Fitore bindëse 3-0 kundër Arsenalit në Old Trafford",           pershkrimi:"Gola nga Rashford, Bruno dhe Hojlund vendosën rezultatin në javën e 22-të të Premier League.", foto:"https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800&q=80", autori:"Redaksia" },
  { id:"s7", kategoria:"LËNDIME",     titulli:"Lëndimi i Mainit — jashtë deri në fund të janarit",            pershkrimi:"Skani ka treguar dëmtim muskulor. Stafi mjekësor është optimist për kthim para derby-t.", foto:"https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80", autori:"Redaksia" },
];

const KATEGORITE  = ["TË GJITHA","TRANSFERIME","NDESHJE","LËNDIME","KLUBI","AKADEMIA"];
const BADGE_COLOR = { TRANSFERIME:"#cc0000", NDESHJE:"#16a34a", "LËNDIME":"#d97706", KLUBI:"#2563eb", AKADEMIA:"#7c3aed" };
const MU_CREST    = "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg";
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL",{day:"2-digit",month:"short",year:"numeric"}) : "";

function NewsCard({ l, tall, openEdit, handleDelete, isAdmin, onReadMore }) {
  const bg = BADGE_COLOR[l.kategoria] || "#cc0000";
  const isReal = typeof l.id === "number";

  return (
    <div className={`nc ${tall ? "nc--tall" : ""}`} onClick={() => onReadMore(l)}>
      <div className="nc__imgwrap">
        {l.foto
          ? <img src={l.foto} alt={l.titulli} className="nc__img" onError={e => e.target.style.display="none"} />
          : <div className="nc__img--fallback"><img src={MU_CREST} alt="" style={{ height:52, opacity:0.18 }} /></div>}
        <span className="nc__badge" style={{ background: bg }}>{l.kategoria}</span>
        {isAdmin && isReal && (
          <div className="nc__admin" onClick={e => e.stopPropagation()}>
            <button onClick={() => openEdit(l)}><i className="bi bi-pencil" /></button>
            <button onClick={() => handleDelete(l.id)}><i className="bi bi-trash" /></button>
          </div>
        )}
      </div>
      <div className="nc__body">
        {l.created_at && <div className="nc__date">{fmtDate(l.created_at)}</div>}
        <h3 className={`nc__title ${tall ? "nc__title--lg" : ""}`}>{l.titulli}</h3>
        {l.pershkrimi && <p className="nc__desc">{l.pershkrimi}</p>}
        <button className="nc__btn" onClick={e => { e.stopPropagation(); onReadMore(l); }}>
          Lexo Më Shumë
        </button>
      </div>
    </div>
  );
}

export default function Lajmet() {
  const [kategoriaAktive, setKategoriaAktive] = useState("TË GJITHA");
  const [activeSeason, setActiveSeason]       = useState(null);
  const [lajmet, setLajmet]                   = useState([]);
  const [show, setShow]                       = useState(false);
  const [editId, setEditId]                   = useState(null);
  const [detailLajm, setDetailLajm]           = useState(null);
  const [form, setForm] = useState({ titulli:"", pershkrimi:"", kategoria:"", foto:"", autori:"" });

  const isAdmin = (localStorage.getItem("role") || "").toLowerCase() === "admin";

  useEffect(() => {
    fetchLajmet();
    api.get("/api/seasons/active").then(r => { if (r.data?.emertimi) setActiveSeason(r.data); }).catch(() => {});
  }, []);

  const fetchLajmet = async () => {
    try { const r = await api.get(API); setLajmet(Array.isArray(r.data) ? r.data : []); }
    catch(err) { console.log(err); }
  };

  const openAdd  = () => { setEditId(null); setForm({titulli:"",pershkrimi:"",kategoria:"",foto:"",autori:""}); setShow(true); };
  const openEdit = (l) => { setEditId(l.id); setForm({titulli:l.titulli||"",pershkrimi:l.pershkrimi||"",kategoria:l.kategoria||"",foto:l.foto||"",autori:l.autori||""}); setShow(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt?")) return;
    try { await api.delete(`${API}/${id}`); fetchLajmet(); } catch(err) { console.log(err); }
  };

  const handleSubmit = async () => {
    try {
      if (editId) await api.put(`${API}/${editId}`, form);
      else        await api.post(API, form);
      await fetchLajmet();
      setShow(false); setEditId(null);
      setForm({titulli:"",pershkrimi:"",kategoria:"",foto:"",autori:""});
    } catch(err) { alert("Gabim: " + (err.response?.data?.message || err.message)); }
  };

  const source   = lajmet.length > 0 ? lajmet : LAJMET_DATA;
  const filtered = kategoriaAktive === "TË GJITHA" ? source : source.filter(l => l.kategoria === kategoriaAktive);
  const cardProps = { openEdit, handleDelete, isAdmin, onReadMore: setDetailLajm };

  return (
    <div className="mu-wrap">
      <Navbar />

      {/* ── HERO HEADER ── */}
      <div style={{ position:"relative", background:"#cc0000", minHeight:200, display:"flex", alignItems:"flex-end", overflow:"hidden" }}>
        {/* stripe e djathtë e errët */}
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"45%", background:"rgba(0,0,0,0.18)", clipPath:"polygon(12% 0, 100% 0, 100% 100%, 0% 100%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:5, padding:"36px 50px 28px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <span style={{ background:"rgba(0,0,0,0.28)", color:"#fff", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", padding:"4px 12px" }}>
              {activeSeason ? `Sezoni ${activeSeason.emertimi}` : "Sezoni 2025/26"}
            </span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase" }}>Blog &amp; Media</span>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(52px, 7vw, 78px)", color:"#fff", letterSpacing:4, lineHeight:1, margin:0 }}>LAJMET</h1>
        </div>
        {isAdmin && (
          <div style={{ position:"absolute", bottom:28, right:50, zIndex:5 }}>
            <button className="lj-hero__btn" onClick={openAdd}>+ SHTO LAJM</button>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="lj-tabs">
        <div className="lj-tabs__inner">
          {KATEGORITE.map(kat => (
            <button key={kat} className={`lj-tab ${kategoriaAktive===kat?"lj-tab--active":""}`}
              onClick={() => setKategoriaAktive(kat)}>
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="lj-content">
        {filtered.length === 0 ? (
          <div className="lj-empty">Nuk ka lajme për këtë kategori.</div>
        ) : (
          <div className="lj-grid">
            {filtered[0] && (
              <div className="lj-grid__featured">
                <NewsCard l={filtered[0]} tall {...cardProps} />
              </div>
            )}
            {filtered.slice(1).map(l => (
              <div key={l.id} className="lj-grid__item">
                <NewsCard l={l} {...cardProps} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {detailLajm && (
        <Modal show={!!detailLajm} onHide={() => setDetailLajm(null)} centered size="lg">
          <Modal.Header closeButton style={{background:"#1a1a1a",borderBottom:"1px solid #333"}}>
            <span style={{
              background: BADGE_COLOR[detailLajm.kategoria] || "#cc0000",
              color:"#fff", fontSize:10, fontWeight:700, letterSpacing:2,
              textTransform:"uppercase", padding:"4px 12px"
            }}>{detailLajm.kategoria}</span>
          </Modal.Header>
          <Modal.Body style={{background:"#1a1a1a",padding:0}}>
            {detailLajm.foto && (
              <img src={detailLajm.foto} alt={detailLajm.titulli}
                style={{width:"100%",height:300,objectFit:"cover",display:"block"}}
                onError={e => e.target.style.display="none"} />
            )}
            <div style={{padding:"28px 32px"}}>
              {detailLajm.created_at && (
                <div style={{color:"#cc0000",fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>
                  {fmtDate(detailLajm.created_at)}
                </div>
              )}
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",color:"#fff",fontSize:30,letterSpacing:1,lineHeight:1.1,marginBottom:16}}>
                {detailLajm.titulli}
              </h2>
              <p style={{color:"#bbb",fontSize:15,lineHeight:1.75,margin:0}}>
                {detailLajm.pershkrimi}
              </p>
              {detailLajm.autori && (
                <div style={{color:"#555",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginTop:20,paddingTop:16,borderTop:"1px solid #333"}}>
                  Autori: <span style={{color:"#888"}}>{detailLajm.autori}</span>
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* ── EDIT/ADD MODAL ── */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton style={{background:"#1a1a1a",borderBottom:"1px solid #333"}}>
          <Modal.Title style={{color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,fontSize:22}}>
            {editId ? "EDITO LAJMIN" : "SHTO LAJM TË RI"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background:"#1a1a1a"}}>
          <Form>
            {[{name:"titulli",label:"TITULLI"},{name:"pershkrimi",label:"PËRSHKRIMI",textarea:true},{name:"foto",label:"FOTO (URL)"},{name:"autori",label:"AUTORI"}].map(f=>(
              <Form.Group className="mb-3" key={f.name}>
                <Form.Label style={{color:"#aaa",fontSize:11,fontWeight:700,letterSpacing:1}}>{f.label}</Form.Label>
                <Form.Control as={f.textarea?"textarea":"input"} rows={f.textarea?3:undefined}
                  value={form[f.name]} onChange={e=>setForm({...form,[f.name]:e.target.value})}
                  style={{background:"#111",border:"1px solid #333",color:"#fff"}} />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label style={{color:"#aaa",fontSize:11,fontWeight:700,letterSpacing:1}}>KATEGORIA</Form.Label>
              <Form.Select value={form.kategoria} onChange={e=>setForm({...form,kategoria:e.target.value})}
                style={{background:"#111",border:"1px solid #333",color:"#fff"}}>
                <option value="">-- Zgjidh --</option>
                {KATEGORITE.filter(k=>k!=="TË GJITHA").map(k=><option key={k} value={k}>{k}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{background:"#1a1a1a",borderTop:"1px solid #333"}}>
          <Button variant="secondary" onClick={()=>setShow(false)}>Anulo</Button>
          <Button onClick={handleSubmit} style={{background:"#cc0000",border:"none",fontWeight:700}}>
            {editId?"Ruaj Ndryshimet":"Shto Lajmin"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
