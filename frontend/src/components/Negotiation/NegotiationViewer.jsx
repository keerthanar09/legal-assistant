import React, { useEffect, useState } from "react";

export default function NegotiationViewer() {
  const [negotiation, setNegotiation] = useState(null);
  const [clauses, setClauses] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem("negotiation_analysis");
    if (!data) return;

    const parsed = JSON.parse(data);
    setNegotiation(parsed);

    // Accept both: top-level array or { clauses: [...] }
    const raw = Array.isArray(parsed) ? parsed : parsed?.clauses ?? [];

    // Normalize fields and keep original index for stable keys
    const normalized = raw.map((c, i) => ({
      clause_number: c?.clause_number ?? null,
      clause_text: c?.clause_text ?? c?.text ?? "",
      clause_risk: (c?.clause_risk ?? c?.risk ?? "medium").toLowerCase(),
      negotiation: c?.negotiation ?? "NIL",
      __origIndex: i,
    }));

    setClauses(normalized);
  }, []);

  if (!negotiation || clauses.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-10">
        <div className="bg-white/10 rounded-xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-accentGreen">
            Negotiation Analysis
          </h2>
          <p className="text-gray-400">
            No negotiation analysis found. Please upload and demystify a document
            first.
          </p>
        </div>
      </div>
    );
  }

  // main render - place this inside your <div className="flex flex-row gap-6 p-10 max-h-screen w-full">
  return (
    <div className="flex flex-row gap-6 p-10 max-h-screen w-full overflow-y-auto">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {clauses.map((clause, idx) => {
          // color badge for risk
          const risk = (clause.clause_risk || "medium").toLowerCase();
          const badgeClass =
            risk === "very high" || risk === "high"
              ? "bg-orange-600 text-white"
              : risk === "medium"
              ? "bg-yellow-500 text-black"
              : "bg-green-500 text-black";

          return (
            <div
              key={clause.__origIndex}
              className="bg-white/10 rounded-xl p-6 shadow-lg flex flex-col gap-3 break-words"
            >
              <div className="flex items-center justify-between">
                {/* Use sequential numbering for heading to keep it unique */}
                <h3 className="text-xl font-bold text-accentGreen">
                  Clause {idx + 1}
                </h3>

                {/* Show model-provided number as a secondary label if present
                {clause.clause_number && (
                  <span className="text-sm text-gray-400">
                    Model#: {clause.clause_number}
                  </span>
                )} */}
              </div>

              <div>
                <div className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold text-white">Text:</span>
                </div>
                <p className="text-gray-200 text-sm whitespace-pre-wrap">
                  {clause.clause_text}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Risk:</span>
                  <span className={`px-2 py-1 rounded text-sm ${badgeClass}`}>
                    {risk}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-white">
                    Negotiation:
                  </span>{" "}
                  <span className="text-gray-200 text-sm">{clause.negotiation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
