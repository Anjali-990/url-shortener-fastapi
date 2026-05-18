import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onSearch }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <div className="navbar-custom">
        {/* Hamburger */}
        <div className="icon-btn" onClick={() => setOpen(true)}>
          <i className="fa-solid fa-bars"></i>
        </div>

        <h3 className="logo-text text-center
        ">URL Shortener</h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Search URLs..."
          className="search-box"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* OVERLAY (click to close) */}
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* CLOSE BUTTON (TOP RIGHT FIXED) */}
        <div className="sidebar-header">
          <h4>WELCOME 👋</h4>

          <i
            className="fa-solid fa-xmark close-icon"
            onClick={() => setOpen(false)}
          ></i>
        </div>

        <ul className="menu">
          <li onClick={() => navigate("/")}>
            <i className="fa-solid fa-house"></i> Home
          </li>

          <li onClick={() => navigate("/my-urls")}>
            <i className="fa-solid fa-link"></i> My URLs
          </li>

          <li onClick={() => navigate("/analytics")}>
            <i className="fa-solid fa-chart-line"></i> Analytics
          </li>

          <li onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </li>
        </ul>
      </div>
    </>
  );
}
