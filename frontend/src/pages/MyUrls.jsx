import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./MyUrls.css";

export default function MyUrls() {
  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const res = await API.get("/my-urls");
      setUrls(res.data.urls || []);
    } catch (err) {
      navigate("/login");
    }
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const filteredUrls = urls.filter((url) =>
    url.original_url.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (code) => {
    try {
      await API.delete(`/delete/${code}`);
      fetchUrls();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const getExpiryText = (expiryDate) => {
    if (!expiryDate) return null;

    const now = new Date();
    const expiry = new Date(expiryDate);

    const diffMs = expiry - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs > 0) {
      if (diffDays === 0) return "Expires today";
      if (diffDays === 1) return "Expires in 1 day";
      return `Expires in ${diffDays} days`;
    } else {
      const pastDays = Math.abs(diffDays);
      if (pastDays === 0) return "Expired today";
      if (pastDays === 1) return "Expired 1 day ago";
      return `Expired ${pastDays} days ago`;
    }
  };

  return (
    <>
      <Navbar onSearch={setSearch} />

      <div className="dashboard-container">
        <div className="container">
          <h2 className="dashboard-title">
            <i className="fa-solid fa-folder-open"></i> My URLs Dashboard
          </h2>

          {filteredUrls.length === 0 ? (
            <p className="text-center text-light">No URLs found</p>
          ) : (
            <div className="row">
              {filteredUrls.map((url, i) => {
                const clickCount = Array.isArray(url.clicks)
                  ? url.clicks.length
                  : url.clicks || 0;

                const expiryRaw = url.expiry?.$date || url.expiry;

                const isExpired = url.is_active === false;

                const isLong = url.original_url.length > 50;

                return (
                  <div className="col-md-6 col-lg-4 mb-4" key={i}>
                    <div
                      className={`url-card ${isExpired ? "expired-card" : ""}`}
                    >
                      {/* HEADER */}
                      <div className="card-header-custom d-flex justify-content-between">
                        <span>🔗 Short Link</span>

                        {isExpired && (
                          <span className="badge bg-danger">Expired</span>
                        )}
                      </div>

                      {/* BODY */}
                      <div className="card-body-custom">
                        <a
                          href={
                            isExpired
                              ? "#"
                              : `http://127.0.0.1:8002/${url.short_code}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className={`short-link ${
                            isExpired ? "disabled-link" : ""
                          }`}
                          onClick={(e) => {
                            if (isExpired) {
                              e.preventDefault();
                              alert("⚠️ This link has expired");
                            }
                          }}
                        >
                          {url.short_code}
                        </a>

                        {/* 🔥 ORIGINAL URL WITH SEE MORE */}
                        <p className="original-url">
                          {expanded[i] || !isLong
                            ? url.original_url
                            : url.original_url.slice(0, 50) + "..."}

                          {isLong && (
                            <span
                              className="see-more"
                              onClick={() => toggleExpand(i)}
                            >
                              {expanded[i] ? " ...See less" : " ...See more"}
                            </span>
                          )}
                        </p>
                        {/* 🔥 EXPIRY COUNTDOWN */}
                        {url.expiry && (
                          <div
                            className={`expiry-text ${isExpired ? "expired-text" : ""}`}
                          >
                            <i className="fa-solid fa-hourglass-half"></i>{" "}
                            {isExpired ? "Expired" : getExpiryText(url.expiry)}
                          </div>
                        )}
                        {/* STATS */}
                        <div className="stats">
                          <span className="badge clicks">
                            {clickCount} Clicks
                          </span>
                        </div>

                        {/* 🔥 BIG EXPIRED TEXT */}
                        {isExpired && (
                          <div className="expired-overlay">
                            <i className="fa-solid fa-circle-exclamation"></i>{" "}
                            THIS LINK IS ON VIEW-MODE ONLY, CAN BE DELETED!{" "}
                          </div>
                        )}

                        {/* ACTIONS */}
                        <div className="actions">
                          <button
                            className="btn btn-copy"
                            disabled={isExpired}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `http://127.0.0.1:8002/${url.short_code}`,
                              );
                              alert("Copied!");
                            }}
                          >
                            <i className="fa-solid fa-copy"></i> Copy
                          </button>

                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(url.short_code)}
                          >
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
