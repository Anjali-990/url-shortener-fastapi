import { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);

  // ✅ FETCH USER URLS
  const fetchUrls = async () => {
    try {
      const res = await API.get("/my-urls");
      console.log("FULL DATA:", res.data.urls); // ✅ debug here
      setUrls(res.data.urls || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);
  // ✅ SHORTEN URL
  const handleShorten = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    try {
      setLoading(true);
      // ✅ FIXED ROUTE
      const res = await API.post("/shorten", {
        original_url: url,
      });

      setShortUrl(res.data.short_url);
      setUrl("");

      fetchUrls(); // refresh
    } catch (err) {
      console.error(err);
      alert("Error shortening URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar onSearch={() => {}} />

      <div className="home-container d-flex flex-column align-items-center">
        {/* 🔹 SHORTEN CARD */}
        <div className="home-card">
          <h1 className="home-title">
            Shorten Your URL <i class="fa-solid fa-jet-fighter"></i>
          </h1>

          <p className="home-subtitle">
            Fast, simple & powerful link shortener
          </p>

          <div className="input-group mt-4">
            <input
              type="text"
              className="form-control custom-input"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              className="btn btn-success custom-btn"
              onClick={handleShorten}
            >
              {loading ? "..." : "Shorten"}
            </button>
          </div>

          {shortUrl && (
            <div className="result-box mt-4">
              <p className="mb-1 text-muted">Your Short URL</p>
              <a href={shortUrl} target="_blank" rel="noreferrer">
                {shortUrl}
              </a>
            </div>
          )}
        </div>

        {/* 🔻 TABLE CARD */}
        <div className="table-card mt-5 w-75">
          <h4 className="mb-3">
            <i className="fa-solid fa-chart-simple"></i> Your URLs
          </h4>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Short Link</th>
                  <th>Original Link</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {urls.length > 0 ? (
                  urls.map((item, index) => {
                    const clickCount = Array.isArray(item.clicks)
                      ? item.clicks.length
                      : item.clicks || 0;

                    let formattedDate = "—";

                    if (item.created_at) {
                      const raw = item.created_at?.$date || item.created_at;
                      const dateObj = new Date(raw);

                      if (!isNaN(dateObj)) {
                        formattedDate = dateObj.toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        });
                      } else {
                        formattedDate = "Invalid Date";
                      }
                    }

                    return (
                      <tr key={index}>
                        <td>
                          <a
                            href={`http://127.0.0.1:8002/${item.short_code}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.short_code}
                          </a>
                        </td>

                        <td
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {item.original_url}
                        </td>

                        <td>
                          <i className="fa-solid fa-eye"></i> {clickCount}
                        </td>

                        <td>
                          <span
                            className={
                              item.is_active
                                ? "badge bg-success"
                                : "badge bg-secondary"
                            }
                          >
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>{formattedDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No URLs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
