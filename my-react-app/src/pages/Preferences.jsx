import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "./Login.css"
import "./Preferences.css"

function Preferences() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const options = [
    { id: "lajme", label: "Lajmet e fundit", desc: "Transferime, konferenca, deklarata" },
    { id: "ndeshje", label: "Ndeshjet", desc: "Rezultate, statistika, analizë" },
    { id: "lojtaret", label: "Lojtarët", desc: "Performanca dhe lajme për lojtarë" },
    { id: "bileta",  label: "Biletat", desc: "Disponueshmëria e biletave" },
    { id: "merkato",  label: "Merkato", desc: "Transferime dhe huazime" },
    { id: "akademia", label: "Akademia", desc: "Lojtarët e rinj dhe talentët" },
  ]

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

 const handleSubmit = () => {
  console.log("Preferencat:", selected)
  setSubmitted(true);
  setTimeout(() => navigate("/"), 2000);
}

  if (submitted) {
    return (
      <div className="page">
        <div className="top-section">
          <div className="logo-circle">
            <img src="/manchesterlogo.png" alt="MU" style={{ width: "90px", height: "90px", objectFit: "contain" }} />
          </div>
          <h1 className="club-title">Manchester <span>United</span> FC</h1>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "50px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ color: "#fff", marginBottom: "8px" }}>Mirë se vjen në familje!</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
            Preferencat u ruajtën me sukses!
          </p>
          <button className="btn-login" onClick={() => navigate("/")}>
  SHKO TE FAQJA KRYESORE →
</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="top-section">
        <div className="logo-circle">
          <img src="/manchesterlogo.png" alt="MU" style={{ width: "90px", height: "90px", objectFit: "contain" }} />
        </div>
        <h1 className="club-title">Manchester <span>United</span> FC</h1>
        <p className="club-subtitle">Personalizo përvojën tënde!</p>
      </div>

      <div className="card" style={{ maxWidth: "520px" }}>
        <div className="card-top">
          <div className="red-bar"></div>
          <div className="welcome">A dëshiron të njoftohesh? </div>
        </div>

        <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>
          Zgjidh temat për të cilat dëshiron të marrësh njoftime:
        </p>

        <div className="pref-grid">
          {options.map(opt => (
            <div
              key={opt.id}
              className={`pref-card ${selected.includes(opt.id) ? "pref-selected" : ""}`}
              onClick={() => toggle(opt.id)}
            >
      
              <div className="pref-label">{opt.label}</div>
              <div className="pref-desc">{opt.desc}</div>
              {selected.includes(opt.id) && (
                <div className="pref-check">✓</div>
              )}
            </div>
          ))}
        </div>

        <button
          className="btn-login"
          onClick={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          {selected.length === 0 ? "KALO KËTË HAP →" : `KONFIRMO (${selected.length} zgjedhje) →`}
        </button>
      </div>
    </div>
  )
}

export default Preferences