import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username.trim())
      newErrors.username = "Username ose email eshte i detyrueshëm!";
    if (!password.trim())
      newErrors.password = "Fjalëkalimi eshte i detyrueshëm!";
    return newErrors;
  };

 const handleLogin = async (e) => {
  e.preventDefault();

  const newErrors = validate();

  if (Object.keys(newErrors).length > 0) {

    setErrors(newErrors);

    return;
  }

  setErrors({});

   
   try {
    const res = await api.post("/login", { username, password });
    const data = res.data;

    localStorage.setItem("accessToken",  data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("isLoggedIn",   "true");
    localStorage.setItem("role",         data.user.role);
    localStorage.setItem("user",         JSON.stringify(data.user));

    if (["Admin", "Trajner", "Menaxher"].includes(data.user.role)) {
      navigate("/dashboard");
    } else if (!data.hasPreferences) {
      navigate("/preferences");
    } else {
      navigate("/");
    }

  } catch (err) {
    setErrors({ general: err.response?.data?.message || "Server error" });
  }
 };

  return (
    <div className="page">
      <div className="top-section">
        <div className="logo-circle">
          <img
            src="/manchesterlogo.png"
            alt="MU"
            style={{ width: "90px", height: "90px", objectFit: "contain" }}
          />
        </div>
        <h1 className="club-title">
          Manchester <span>United</span> FC
        </h1>
        <p className="club-subtitle">"United we stand."</p>
      </div>

      <form className="card" onSubmit={handleLogin} autoComplete="off">
        <div className="card-top">
          <div className="red-bar"></div>
          <div className="welcome">Mirë se erdhe!</div>
        </div>

        <div className="field">
          <label>Username ose Email</label>
          <input
            type="text"
            autoComplete="off"
            placeholder="Shkruaj username-in..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors((prev) => ({ ...prev, username: "" }));
            }}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && (
            <span className="error" style={{ textAlign: "left" }}>
              {errors.username}
            </span>
          )}
        </div>

        <div className="field">
          <label>Fjalëkalimi</label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Shkruaj fjalëkalimin..."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && (
            <span className="error" style={{ textAlign: "left" }}>
              {errors.password}
            </span>
          )}
        </div>

        {/* <div className="row">
          <a href="#">Ke harruar fjalëkalimin?</a>
        </div> */}

        <button type="submit" className="btn-login">
          KYÇU
        </button>
        {errors.general && <span className="error">{errors.general}</span>}
        <div className="divider">
          <span>ose</span>
        </div>

        <div className="footer">
          Nuk ke llogari?
          <Link to="/register"> Krijo një të re</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
