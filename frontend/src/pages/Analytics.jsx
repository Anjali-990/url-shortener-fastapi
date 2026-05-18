import { useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export default function Analytics() {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAnalytics = async () => {
    if (!code) return alert("Enter short code");

    try {
      setLoading(true);
      const res = await API.get(`analytics/${code}`);
      setData(res.data);
    } catch (err) {
      setData(null);
      alert("Invalid short code");
    } finally {
      setLoading(false);
    }
  };

  // 📈 TIME DATA
  const timeData =
    data &&
    (() => {
      const grouped = {};
      (data.clicks || []).forEach((c) => {
        if (!c.time) return;
        const dateStr = typeof c.time === "object" ? c.time.$date : c.time;
        const date = new Date(dateStr).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + 1;
      });

      return {
        labels: Object.keys(grouped),
        datasets: [
          {
            label: "Clicks per Day",
            data: Object.values(grouped),
            backgroundColor: "#22c55e",
            borderRadius: 6,
          },
        ],
      };
    })();

  const deviceData = data && {
    labels: ["Mobile", "Desktop"],
    datasets: [
      {
        data: [data.device_stats.mobile || 0, data.device_stats.desktop || 0],
        backgroundColor: ["#22c55e", "#3b82f6"],
      },
    ],
  };

  const countryData = data && {
    labels: Object.keys(data.country_stats || {}),
    datasets: [
      {
        data: Object.values(data.country_stats || {}),
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#a855f7",
        ],
      },
    ],
  };

  const topCountry =
    data &&
    Object.entries(data.country_stats || {}).sort((a, b) => b[1] - a[1])[0];

  const topDevice =
    data &&
    Object.entries(data.device_stats || {}).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <Navbar />

      <div className="home-container d-flex flex-column align-items-center">
        {/* 🔹 HEADER */}
        <div className="home-card text-center hover-card">
          <h2 className="home-title">
            <i className="fa-solid fa-chart-column me-2"></i>
            Analytics Dashboard
          </h2>

          <div className="input-group mt-4">
            <input
              type="text"
              className="form-control custom-input"
              placeholder="Enter short code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              className="btn btn-success custom-btn"
              onClick={getAnalytics}
              disabled={loading}
            >
              {loading ? "Loading..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* ⏳ LOADING */}
        {loading && (
          <div className="mt-5">
            <div className="spinner-border text-success"></div>
          </div>
        )}

        {/* ❌ EMPTY STATE */}
        {!loading && !data && (
          <p className="mt-4 text-muted ">Enter a code to view analytics</p>
        )}

        {/* ✅ DATA UI */}
        {data && !loading && (
          <>
            {/* 🔥 STATS CARDS */}
            <div className="row w-75 mt-4 g-3">
              {[
                {
                  title: "Total Clicks",
                  value: data.total_clicks,
                  icon: "fa-eye",
                },
                {
                  title: "Mobile",
                  value: data.device_stats.mobile,
                  icon: "fa-mobile-screen",
                },
                {
                  title: "Desktop",
                  value: data.device_stats.desktop,
                  icon: "fa-desktop",
                },
              ].map((card, i) => (
                <div className="col-md-4" key={i}>
                  <div className="card pro-card text-center">
                    <i className={`fa-solid ${card.icon} fa-2x mb-2`}></i>
                    <h6>{card.title}</h6>
                    <h3>{card.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* ⭐ TOP STATS */}
            <div className="d-flex flex-wrap justify-content-center gap-3 ">
              {topCountry && (
                <div className="badge pro-badge">
                  <i class="fa-regular fa-flag"></i> Top Country:{" "}
                  <b>{topCountry[0]}</b> ({topCountry[1]})
                </div>
              )}
              {topDevice && (
                <div className="badge pro-badge">
                  <i class="fa-solid fa-display"></i> Top Device:{" "}
                  <b>{topDevice[0]}</b> ({topDevice[1]})
                </div>
              )}
            </div>

            {/* 📊 CHARTS */}
            <div className="row w-75 g-4">
              <div className="col-lg-6 col-12">
                <div className="card pro-card">
                  <h5>
                    <i className="fa-solid fa-mobile-screen me-2"></i>
                    Device Distribution
                  </h5>
                  <div
                    style={{
                      height: "300px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Pie data={deviceData} />
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-12">
                <div className="card pro-card">
                  <h5>
                    <i className="fa-solid fa-chart-line me-2"></i>
                    Click Trend
                  </h5>
                  <div
                    style={{
                      height: "300px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Bar
                      key={JSON.stringify(timeData)}
                      redraw
                      data={timeData}
                      options={{
                        responsive: true,
                        animation: {
                          duration: 1000,
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COUNTRY */}
            <div className="card pro-card mt-4 w-75">
              <h5>
                <i className="fa-solid fa-globe me-2"></i>
                Country Distribution
              </h5>
              <div
                style={{
                  height: "300px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pie data={countryData} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
