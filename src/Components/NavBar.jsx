import { Link, useNavigate } from "react-router-dom";

const NAV_LINKS = ["Lajmet", "Ndeshjet", "Lojtarët", "Tabela", "Shop"];

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <nav className="mu-nav">
      <div className="mu-nav-left">
        <div className="mu-logo" onClick={() => navigate("/")}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
            alt="MUFC"
            style={{ height: "40px" }}
          />
          <span className="mu-logo-name">Manchester United</span>
        </div>
        <ul className="mu-nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              {link === "Ndeshjet" ? (
                <Link to="/ndeshjet">{link}</Link>
              ) : (
                <a href="#">{link}</a>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mu-nav-right">
        <div
          className="mu-avatar"
          onClick={() => navigate("/ProfilePage")}
          title={`${user.emri} ${user.mbiemri}`}
        >
          {user.emri[0]}
          {user.mbiemri[0]}
        </div>
        <button
          className="mu-btn-solid"
          onClick={() => navigate("/ndeshjet?tab=fixtures")}
        >
          Bli Bileta
        </button>
      </div>
    </nav>
  );
}
