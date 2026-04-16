import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import "./Login.css"

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emri: "",
    mbiemri: "",
    datelindja: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.emri.trim()) newErrors.emri = "Emri është i detyrueshëm!"
    if (!formData.mbiemri.trim()) newErrors.mbiemri = "Mbiemri është i detyrueshëm!"
    if (!formData.datelindja) newErrors.datelindja = "Datëlindja është e detyrueshme!"
    if (!formData.email.trim()) newErrors.email = "Email-i është i detyrueshëm!"
    if (!formData.password.trim()) newErrors.password = "Fjalëkalimi është i detyrueshëm!"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Fjalëkalimet nuk përputhen!"
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleRegister = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    navigate("/preferences")
  }

  return (
    <div className="page">
      <div className="top-section">
        <div className="logo-circle">
          <img src="/manchesterlogo.png" alt="MU" style={{ width: "90px", height: "90px", objectFit: "contain" }} />
        </div>
        <h1 className="club-title">Manchester <span>United</span> FC</h1>
        <p className="club-subtitle">"United we stand."</p>
      </div>

      <div className="card">
        <div className="card-top">
          <div className="red-bar"></div>
          <div className="welcome">Krijo Llogari!</div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Emri</label>
            <input
              type="text"
              name="emri"
              placeholder="Emri..."
              value={formData.emri}
              onChange={handleChange}
              className={errors.emri ? "input-error" : ""}
            />
            {errors.emri && <span className="error">{errors.emri}</span>}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Mbiemri</label>
            <input
              type="text"
              name="mbiemri"
              placeholder="Mbiemri..."
              value={formData.mbiemri}
              onChange={handleChange}
              className={errors.mbiemri ? "input-error" : ""}
            />
            {errors.mbiemri && <span className="error">{errors.mbiemri}</span>}
          </div>
        </div>

        <div className="field">
          <label>Datëlindja</label>
          <input
            type="date"
            name="datelindja"
            value={formData.datelindja}
            onChange={handleChange}
            className={errors.datelindja ? "input-error" : ""}
            style={{ colorScheme: "dark" }}
          />
          {errors.datelindja && <span className="error">{errors.datelindja}</span>}
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Shkruaj email-in..."
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="field">
          <label>Fjalëkalimi</label>
          <input
            type="password"
            name="password"
            placeholder="Shkruaj fjalëkalimin..."
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="field">
          <label>Konfirmo Fjalëkalimin</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Konfirmo fjalëkalimin..."
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "input-error" : ""}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>

        <button className="btn-login" onClick={handleRegister}>
          REGJISTROHU
        </button>

        <div className="divider"><span>ose</span></div>

        <div className="footer">
          Ke llogari? <Link to="/login">Kyçu këtu</Link>
        </div>
      </div>
    </div>
  )
}

export default Register