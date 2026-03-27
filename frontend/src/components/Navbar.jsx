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
      <div
        style={{
          height: "60px",
          background: "#111",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        {/* Hamburger */}
        <div
          style={{ fontSize: "24px", cursor: "pointer" }}
          onClick={() => setOpen(true)}
        >
          <i class="fa-solid fa-bars"></i>
        </div>

        <h3>URL Shortener</h3>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search URLs..."
          onChange={(e) => onSearch(e.target.value)}
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            border: "none",
          }}
        />
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? "0" : "-290px",
          width: "250px",
          height: "100%",
          background: "#222",
          color: "white",
          transition: "0.3s",
          padding: "20px",
          zIndex: 1000,
        }}
      >
        {/* Close */}
        <div
          style={{ textAlign: "right", cursor: "pointer" }}
          onClick={() => setOpen(false)}
        >
          ✖
        </div>

        <h3>WELCOME 👋</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={itemStyle} onClick={() => navigate("/")}>
            <i class="fa-solid fa-house"></i> Home
          </li>
          <li style={itemStyle} onClick={() => navigate("/my-urls")}>
            <i class="fa-solid fa-link"></i> My URLs
          </li>
          <li style={itemStyle} onClick={() => navigate("/analytics")}>
            <i class="fa-solid fa-chart-line"></i> Analytics
          </li>
          <li style={itemStyle} onClick={handleLogout}>
            <i class="fa-solid fa-right-from-bracket"></i> Logout
          </li>
        </ul>
      </div>
    </>
  );
}

const itemStyle = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #444",
};
