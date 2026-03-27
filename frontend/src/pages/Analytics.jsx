import { useState } from "react";
import API from "../api/api";

export default function Analytics() {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);

  const getAnalytics = async () => {
    const res = await API.get(`/analytics/${code}`);
    setData(res.data);
  };

  return (
    <div>
      <h2>Analytics</h2>

      <input
        placeholder="Enter short code"
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={getAnalytics}>Check</button>

      {data && (
        <div>
          <p>Total: {data.total_clicks}</p>
          <p>Mobile: {data.device_stats.mobile}</p>
          <p>Desktop: {data.device_stats.desktop}</p>
        </div>
      )}
    </div>
  );
}
