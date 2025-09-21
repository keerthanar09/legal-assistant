import React, { useState, useEffect } from "react";

export default function SummaryViewer() {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const storedSummary = localStorage.getItem("summary");
    if (storedSummary) {
      try {
        const parsed = JSON.parse(storedSummary);
        if (parsed && typeof parsed.summary === "string") {
          setSummary(parsed.summary);
        } else {
          setSummary("No summary available.");
        }
      } catch (err) {
        console.error("Failed to parse stored summary:", err);
        setSummary("No summary available.");
      }
    }
  }, []);

  return (
    <div className="bg-softGreen p-6 rounded-xl shadow-lg shadow-green-300 w-full h-full overflow-y-auto whitespace-pre-wrap">
      <h2 className="text-xl mb-4">Summary</h2>
      <div>{summary || "No summary available."}</div>
    </div>
  );
}
