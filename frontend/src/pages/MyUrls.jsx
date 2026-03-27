import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MyUrls() {
  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUrls = async () => {
      try {
        const res = await API.get("/auth/my-urls");
        setUrls(res.data.urls || []);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUrls();
  }, []);

  // 🔍 FILTER LOGIC
  const filteredUrls = urls.filter((url) =>
    url.original_url.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Navbar onSearch={setSearch} />

      <div style={{ marginTop: "60px", padding: "20px" }}>
        <h2>My URLs</h2>

        {filteredUrls.length === 0 ? (
          <p>No URLs found</p>
        ) : (
          filteredUrls.map((url, i) => {
            const clickCount = Array.isArray(url.clicks)
              ? url.clicks.length
              : url.clicks || 0;

            return (
              <div
                key={i}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>Short URL:</strong>{" "}
                  <a
                    href={`http://127.0.0.1:8001/${url.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    http://127.0.0.1:8001/{url.short_code}
                  </a>
                </p>

                <p>
                  <strong>Original URL:</strong> {url.original_url}
                </p>

                <p>
                  <strong>Clicks:</strong> {clickCount}
                </p>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `http://127.0.0.1:8001/${url.short_code}`,
                    );
                    alert("Copied!");
                  }}
                >
                  Copy
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
