import { useState } from "react"
import { Link } from "react-router-dom"
import "./Login.css"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = "Username ose email eshte i detyrueshëm!"
    if (!password.trim()) newErrors.password = "Fjalëkalimi eshte i detyrueshëm!"
    return newErrors
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    console.log("Login:", username, password)
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
          <div className="welcome">Mirë se erdhe!</div>
        </div>

        <div className="field">
          <label>Username ose Email</label>
          <input
            type="text"
            placeholder="Shkruaj username-in..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setErrors((prev) => ({ ...prev, username: "" }))
            }}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="field">
          <label>Fjalëkalimi</label>
          <input
            type="password"
            placeholder="Shkruaj fjalëkalimin..."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: "" }))
            }}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="row">
          <a href="#">Ke harruar fjalëkalimin?</a>
        </div>

        <button className="btn-login" onClick={handleLogin}>
          KYÇU
        </button>

        <div className="divider"><span>ose</span></div>

        <div className="footer">Nuk ke llogari?
         <Link to="/register"> Krijo një të re</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
