import { useState, useEffect } from "react";
import Navbar from "../Components/NavBar";
import api from "../api/axiosInstance";
import "./ManchesterUnitedHome.css";

const TABS = ["Statistika", "Ndeshjet", "Skuadra", "Tabela", "Top Scorer"];
const MU_CREST = "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg";

const dayNames   = ["E Diel","E Hënë","E Martë","E Mërkurë","E Enjte","E Premte","E Shtunë"];
const monthNames = ["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"];

function slugPhoto(first, last) {
  const norm = s => (s||"").toLowerCase()
    .replace(/[ıİ]/g,"i").replace(/[áàäâ]/g,"a").replace(/[éèëê]/g,"e")
    .replace(/[íìïî]/g,"i").replace(/[óòöô]/g,"o").replace(/[úùüû]/g,"u")
    .replace(/ñ/g,"n").replace(/ç/g,"c").replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
  const f = (first||"").trim(), l = (last||"").trim();
  return !f || f===l ? `/players/${norm(l)}.png` : `/players/${norm(f)}-${norm(l)}.png`;
}

const DARK_CARD = {
  background: "linear-gradient(135deg, rgba(45,6,6,0.95) 0%, rgba(14,2,2,0.98) 100%)",
  border: "1px solid rgba(204,0,0,0.2)",
  borderRadius: 14,
  boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
};

const POZ_ORDER = { Sulmues:0, Mesfushor:1, Mbrojtës:2, Portier:3 };

export default function SeasonArchive() {
  const [seasons, setSeasons]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState("Statistika");
  const [matches, setMatches]   = useState([]);
  const [players, setPlayers]   = useState([]);
  const [standings,      setStandings]      = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    api.get("/api/seasons")
      .then(r => { setSeasons(r.data); if (r.data.length > 0) selectSeason(r.data[0]); })
      .catch(() => {});
    api.get("/api/players")
      .then(r => setPlayers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const selectSeason = async (s) => {
    setSelected(s); setTab("Statistika"); setMatches([]); setStandings([]);
    setLoadingMatches(true);
    try {
      const r = await api.get("/api/ndeshjet");
      const start = new Date(s.viti_fillimit), end = new Date(s.viti_perfundimit);
      setMatches(r.data.filter(m => { const d = new Date(m.data_ndeshjes); return d >= start && d <= end; }));
    } catch {}
    setLoadingMatches(false);
    try {
      const r = await api.get(`/api/seasons/${s.id}/standings`);
      const data = r.data;
      console.log("standings:", data);
      setStandings(Array.isArray(data) ? data : []);
    } catch(e) { console.error("standings error:", e); }
  };

  // ── Llogarit standings: MU nga ndeshjet reale + të tjerët nga DB ─────────
  const buildStandings = () => {
    const played = matches.filter(m => m.statusi === "Luajtur");
    let W=0,D=0,L=0,GF=0,GA=0;
    played.forEach(m => {
      const h=Number(m.rezultati_shtepia||0), a=Number(m.rezultati_jashte||0);
      GF+=h; GA+=a;
      if(h>a) W++; else if(h===a) D++; else L++;
    });
    const muRow = {
      ekipi:"Manchester United", ndeshje:played.length,
      fituar:W, barazim:D, humbur:L, gola_f:GF, gola_m:GA,
      pike: W*3+D, isUs:true,
    };

    const others = standings
      .filter(r => !r.is_us)
      .map(r => ({ ...r, pike: r.fituar*3 + r.barazim, isUs:false }));

    const all = [...others, muRow]
      .sort((a,b) => b.pike - a.pike || (b.gola_f-b.gola_m) - (a.gola_f-a.gola_m))
      .map((r,i) => ({ ...r, pozita: i+1 }));
    return all;
  };

  // ── Top scorer: sulmueset + mesfushoret e sortuar nga gola_f (nese ka) ────
  const topScorers = players
    .filter(p => p.pozicioni === "Sulmues" || p.pozicioni === "Mesfushor")
    .sort((a,b) => (POZ_ORDER[a.pozicioni]??9) - (POZ_ORDER[b.pozicioni]??9))
    .slice(0,5);

  const statusPill = (st) => {
    const map = { Aktiv:["#14532d","#4ade80"], Mbyllur:["#7f1d1d","#f87171"] };
    const [bg,color] = map[st] || ["#1e3a5f","#60a5fa"];
    return <span style={{ fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color }}>{st}</span>;
  };

  const PlayerAvatar = ({ p, size=52, fontSize=20 }) => {
    const src = p.foto_url || slugPhoto(p.emri, p.mbiemri);
    const [err, setErr] = useState(false);
    return err || !src ? (
      <div style={{ width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#CC0000,#880000)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize,color:"#fff",fontWeight:900,flexShrink:0 }}>
        {(p.numri_faneles||p.numri_fanellës||"?")}
      </div>
    ) : (
      <img src={src} alt={p.mbiemri} onError={()=>setErr(true)}
        style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",objectPosition:"top",border:"2px solid rgba(204,0,0,0.35)",flexShrink:0 }} />
    );
  };

  return (
    <div style={{
      background:`
        radial-gradient(ellipse at 85% 10%, rgba(204,0,0,0.4) 0%, transparent 42%),
        radial-gradient(ellipse at 10% 85%, rgba(140,0,0,0.28) 0%, transparent 42%),
        linear-gradient(160deg, #3a0000 0%, #1c0000 50%, #0d0000 100%)
      `,
      minHeight:"100vh", color:"white", fontFamily:"'Barlow', Arial, sans-serif",
      position:"relative", overflowX:"hidden",
    }}>
      {/* rings */}
      <div style={{ position:"absolute",top:-180,right:-180,width:650,height:650,borderRadius:"50%",border:"1px solid rgba(204,0,0,0.1)",pointerEvents:"none" }} />
      <div style={{ position:"absolute",top:-80,right:-80,width:420,height:420,borderRadius:"50%",border:"1px solid rgba(204,0,0,0.07)",pointerEvents:"none" }} />
      <div style={{ position:"absolute",bottom:80,left:-200,width:700,height:700,borderRadius:"50%",border:"1px solid rgba(204,0,0,0.06)",pointerEvents:"none" }} />

      <div className="mu-wrap" style={{ minHeight:"auto" }}><Navbar /></div>

      {/* ── HERO ── */}
      <div style={{ background:"linear-gradient(135deg,#0e0000 0%,#6B0000 55%,#CC0000 100%)",padding:"48px 52px 36px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-100,right:-100,width:500,height:500,border:"1px solid rgba(255,255,255,0.03)",borderRadius:"50%",pointerEvents:"none" }} />
        <img src={MU_CREST} alt="" style={{ position:"absolute",right:52,top:"50%",transform:"translateY(-50%)",height:180,opacity:0.07,pointerEvents:"none" }} />
        <div style={{ fontSize:11,letterSpacing:4,color:"rgba(255,255,255,0.4)",marginBottom:10,textTransform:"uppercase" }}>Manchester United FC · Historia</div>
        <div style={{ fontSize:72,fontWeight:900,letterSpacing:-2,lineHeight:1,textTransform:"uppercase" }}>Arkiva e Sezoneve</div>
        <div style={{ fontSize:12,marginTop:10,color:"rgba(255,255,255,0.3)",letterSpacing:2 }}>MANCHESTER UNITED F.C.</div>
        <div style={{ display:"flex",gap:36,marginTop:28 }}>
          {[{n:seasons.length||"—",l:"Sezone"},{n:players.length||"—",l:"Lojtarë"}].map(s=>(
            <div key={s.l}>
              <div style={{ fontSize:30,fontWeight:900 }}>{s.n}</div>
              <div style={{ fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display:"flex",maxWidth:1300,margin:"0 auto",padding:"32px 40px",gap:24,alignItems:"flex-start" }}>

        {/* SIDEBAR */}
        <div style={{ width:220,flexShrink:0 }}>
          <div style={{ fontSize:9,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,0.22)",marginBottom:14 }}>Sezoned</div>
          {seasons.map(s => {
            const active = selected?.id === s.id;
            return (
              <div key={s.id} onClick={()=>selectSeason(s)} style={{
                padding:"12px 14px",marginBottom:6,cursor:"pointer",
                background:active?"linear-gradient(135deg,rgba(204,0,0,0.2) 0%,rgba(100,0,0,0.15) 100%)":"transparent",
                borderLeft:`3px solid ${active?"#CC0000":"transparent"}`,
                borderRadius:"0 10px 10px 0",transition:"all 0.18s",
              }}
              onMouseEnter={e=>{ if(!active){e.currentTarget.style.background="rgba(204,0,0,0.08)";e.currentTarget.style.borderLeftColor="rgba(204,0,0,0.4)";}}}
              onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.borderLeftColor="transparent";}}}>
                <div style={{ fontWeight:700,fontSize:15,color:active?"#fff":"rgba(255,255,255,0.5)",marginBottom:5 }}>{s.emertimi}</div>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  {statusPill(s.statusi)}
                  <span style={{ color:"rgba(255,255,255,0.22)",fontSize:11 }}>{s.kompeticionit}</span>
                </div>
              </div>
            );
          })}
          {seasons.length===0 && <div style={{ color:"rgba(255,255,255,0.2)",fontSize:13 }}>Nuk ka sezone</div>}
        </div>

        {/* CONTENT */}
        <div style={{ flex:1,minWidth:0 }}>
          {selected ? (
            <>
              {/* Season banner */}
              <div style={{ ...DARK_CARD,padding:"24px 28px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16,position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",left:0,top:0,bottom:0,width:3,background:"#CC0000",borderRadius:"14px 0 0 14px" }} />
                <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 50%)",pointerEvents:"none" }} />
                <div style={{ position:"relative" }}>
                  <div style={{ fontSize:9,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:"#CC0000",marginBottom:6 }}>Sezoni</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:46,letterSpacing:2,color:"#fff",lineHeight:1 }}>{selected.emertimi}</div>
                  <div style={{ color:"rgba(255,255,255,0.3)",fontSize:13,marginTop:5 }}>
                    {selected.kompeticionit} &nbsp;·&nbsp; {selected.viti_fillimit?.split("T")[0]} → {selected.viti_perfundimit?.split("T")[0]}
                  </div>
                </div>
                {statusPill(selected.statusi)}
              </div>

              {/* Tabs */}
              <div style={{ display:"flex",gap:6,marginBottom:20,flexWrap:"wrap" }}>
                {TABS.map(t=>(
                  <button key={t} onClick={()=>setTab(t)} style={{
                    padding:"8px 20px",borderRadius:20,border:"1px solid",
                    borderColor:tab===t?"#CC0000":"rgba(255,255,255,0.1)",
                    background:tab===t?"#CC0000":"transparent",
                    color:tab===t?"#fff":"rgba(255,255,255,0.4)",
                    fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,letterSpacing:1.5,textTransform:"uppercase",
                    cursor:"pointer",transition:"all 0.2s",
                  }}>{t}</button>
                ))}
              </div>

              {/* ── STATISTIKA ── */}
              {tab==="Statistika" && (() => {
                if (loadingMatches) return <div style={{ padding:60,textAlign:"center",color:"rgba(255,255,255,0.2)" }}>Duke ngarkuar...</div>;
                const played = matches.filter(m => m.statusi==="Luajtur");
                let W=0,D=0,L=0,GF=0,GA=0;
                played.forEach(m => {
                  const h=Number(m.rezultati_shtepia||0), a=Number(m.rezultati_jashte||0);
                  GF+=h; GA+=a;
                  if(h>a) W++; else if(h===a) D++; else L++;
                });
                const gd = GF-GA;
                const pts = W*3+D;
                const rows1 = [
                  { label:"Ndeshje",  val:played.length },
                  { label:"Fituar",   val:W },
                  { label:"Barazim",  val:D },
                  { label:"Humbur",   val:L },
                ];
                const rows2 = [
                  { label:"Gola Shënuar", val:GF },
                  { label:"Gola Marrë",   val:GA },
                  { label:"Diferenca",    val:(gd>0?"+":"")+gd },
                  { label:"Pikë",         val:pts, accent:true },
                ];
                const StatCard = ({label,val,accent}) => (
                  <div style={{ ...DARK_CARD,padding:"24px 16px",textAlign:"center",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",bottom:-8,right:-4,fontSize:68,fontWeight:900,color:"rgba(204,0,0,0.07)",lineHeight:1,userSelect:"none" }}>{val}</div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:58,lineHeight:1,color:accent?"#CC0000":"rgba(255,255,255,0.9)",position:"relative" }}>{val}</div>
                    <div style={{ fontSize:9,textTransform:"uppercase",letterSpacing:2,color:"rgba(255,255,255,0.22)",marginTop:8 }}>{label}</div>
                  </div>
                );
                return (
                  <>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12 }}>
                      {rows1.map(c=><StatCard key={c.label} {...c} />)}
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
                      {rows2.map(c=><StatCard key={c.label} {...c} />)}
                    </div>
                  </>
                );
              })()}

              {/* ── NDESHJET ── */}
              {tab==="Ndeshjet" && (
                <div style={{ ...DARK_CARD,overflow:"hidden" }}>
                  {loadingMatches
                    ? <div style={{ padding:60,textAlign:"center",color:"rgba(255,255,255,0.2)" }}>Duke ngarkuar...</div>
                    : matches.length===0
                      ? <div style={{ padding:60,textAlign:"center",color:"rgba(255,255,255,0.2)" }}>Nuk ka ndeshje</div>
                      : matches.map(m=>{
                          const d=m.data_ndeshjes?new Date(m.data_ndeshjes):null;
                          const played=m.statusi==="Luajtur";
                          const h=Number(m.rezultati_shtepia||0),a=Number(m.rezultati_jashte||0);
                          const res=!played?null:h>a?"W":h<a?"L":"D";
                          const rc=res==="W"?["#14532d","#4ade80"]:res==="D"?["#713f12","#fbbf24"]:["#7f1d1d","#f87171"];
                          return (
                            <div key={m.id} style={{ display:"flex",alignItems:"center",padding:"13px 22px",borderBottom:"1px solid rgba(255,255,255,0.04)",gap:16 }}>
                              <div style={{ width:76,flexShrink:0 }}>
                                <div style={{ color:"rgba(255,255,255,0.2)",fontSize:11 }}>{d?dayNames[d.getDay()]:""}</div>
                                <div style={{ color:"rgba(255,255,255,0.65)",fontSize:13,fontWeight:600 }}>{d?`${d.getDate()} ${monthNames[d.getMonth()]}`:"—"}</div>
                              </div>
                              <span style={{ background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.35)",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:4,flexShrink:0 }}>{m.lloji_kompeticionit||"PL"}</span>
                              <div style={{ flex:1,display:"flex",alignItems:"center",gap:10 }}>
                                <span style={{ color:"#CC0000",fontWeight:700 }}>Man United</span>
                                <span style={{ color:"rgba(255,255,255,0.2)" }}>vs</span>
                                <span style={{ color:"rgba(255,255,255,0.6)" }}>{m.ekipi_kundershtare}</span>
                              </div>
                              <div style={{ fontWeight:900,fontSize:16,color:"#fff",minWidth:64,textAlign:"center" }}>
                                {played?`${h} – ${a}`:m.ora?String(m.ora).slice(0,5):"TBD"}
                              </div>
                              {res&&<div style={{ width:32,height:32,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,background:rc[0],color:rc[1],flexShrink:0 }}>{res}</div>}
                            </div>
                          );
                        })
                  }
                </div>
              )}

              {/* ── SKUADRA ── */}
              {tab==="Skuadra" && (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12 }}>
                  {players.length===0
                    ? <div style={{ color:"rgba(255,255,255,0.2)",padding:60,gridColumn:"1/-1",textAlign:"center" }}>Nuk ka lojtarë</div>
                    : players
                        .sort((a,b)=>(POZ_ORDER[a.pozicioni]??9)-(POZ_ORDER[b.pozicioni]??9)||(a.numri_faneles||99)-(b.numri_faneles||99))
                        .map(p=>(
                        <div key={p.id} style={{ ...DARK_CARD,padding:"18px 14px",textAlign:"center",position:"relative",overflow:"hidden" }}>
                          <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 50%)",pointerEvents:"none" }} />
                          <div style={{ position:"relative" }}>
                            <PlayerAvatar p={p} size={58} fontSize={20} />
                            <div style={{ fontWeight:700,fontSize:13,color:"#fff",marginTop:10,lineHeight:1.2 }}>{p.emri} {p.mbiemri}</div>
                            <div style={{ color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:3 }}>{p.pozicioni||"—"}</div>
                            <div style={{ color:"#CC0000",fontSize:10,fontWeight:700,marginTop:3 }}>{p.kombesia||""}</div>
                            {p.numri_faneles && <div style={{ position:"absolute",top:-18,right:-6,fontFamily:"'Bebas Neue',sans-serif",fontSize:48,color:"rgba(204,0,0,0.1)",lineHeight:1,userSelect:"none" }}>{p.numri_faneles}</div>}
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}

              {/* ── TABELA ── */}
              {tab==="Tabela" && (
                <div style={{ ...DARK_CARD,overflow:"hidden" }}>
                  <div style={{ padding:"14px 22px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontWeight:700,color:"#fff" }}>{selected.kompeticionit} · {selected.emertimi}</span>
                  </div>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"rgba(0,0,0,0.3)" }}>
                        {["Pos","Ekipi","Np","F","B","H","GF","GA","GD","Pikë"].map(h=>(
                          <th key={h} style={{ padding:"10px 12px",color:"rgba(255,255,255,0.2)",fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:1.5,textAlign:h==="Ekipi"?"left":"center",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {buildStandings().map((r,i)=>{
                        const gd=r.gola_f-r.gola_m;
                        return (
                          <tr key={i} style={{ background:r.isUs?"rgba(204,0,0,0.1)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding:"13px 12px",textAlign:"center",fontWeight:700,color:(r.pozita<=4)?"#4ade80":"rgba(255,255,255,0.2)" }}>{r.pozita}</td>
                            <td style={{ padding:"13px 12px",fontWeight:r.isUs?900:500,color:r.isUs?"#CC0000":"rgba(255,255,255,0.8)" }}>{r.ekipi}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"rgba(255,255,255,0.3)" }}>{r.ndeshje}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"rgba(255,255,255,0.8)",fontWeight:600 }}>{r.fituar}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"rgba(255,255,255,0.5)" }}>{r.barazim}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"rgba(255,255,255,0.5)" }}>{r.humbur}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"rgba(255,255,255,0.45)" }}>{r.gola_f}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"rgba(255,255,255,0.45)" }}>{r.gola_m}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:gd>=0?"rgba(255,255,255,0.7)":"rgba(255,100,100,0.8)",fontWeight:600 }}>{gd>0?`+${gd}`:gd}</td>
                            <td style={{ padding:"13px 12px",textAlign:"center",color:"#fff",fontWeight:900 }}>{r.pike}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── TOP SCORER ── */}
              {tab==="Top Scorer" && (
                <div style={{ ...DARK_CARD,overflow:"hidden" }}>
                  <div style={{ padding:"14px 22px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontWeight:700,color:"#fff" }}>Sulmuesit & Mesfushoret · {selected.emertimi}</span>
                  </div>
                  {topScorers.length===0
                    ? <div style={{ padding:60,textAlign:"center",color:"rgba(255,255,255,0.2)" }}>Nuk ka lojtarë</div>
                    : topScorers.map((p,i)=>(
                      <div key={p.id} style={{ display:"flex",alignItems:"center",padding:"16px 22px",borderBottom:"1px solid rgba(255,255,255,0.03)",gap:16,position:"relative" }}>
                        {i===0&&<div style={{ position:"absolute",left:0,top:0,bottom:0,width:3,background:"#CC0000",borderRadius:2 }} />}
                        <div style={{ width:28,fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:i===0?"#fbbf24":"rgba(255,255,255,0.15)",textAlign:"center",flexShrink:0 }}>{i+1}</div>
                        <PlayerAvatar p={p} size={46} fontSize={16} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:800,color:"#fff" }}>{p.emri} {p.mbiemri}</div>
                          <div style={{ color:"rgba(255,255,255,0.25)",fontSize:12 }}>{p.pozicioni} · {p.kombesia||"—"}</div>
                        </div>
                        <div style={{ textAlign:"center",minWidth:44 }}>
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"rgba(255,255,255,0.3)",lineHeight:1,letterSpacing:1 }}>#{p.numri_faneles||"—"}</div>
                          <div style={{ fontSize:8,textTransform:"uppercase",letterSpacing:1.5,color:"rgba(255,255,255,0.15)" }}>Fanela</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:"center",padding:100,color:"rgba(255,255,255,0.18)",fontSize:15 }}>Zgjidh një sezon nga listën</div>
          )}
        </div>
      </div>
    </div>
  );
}
