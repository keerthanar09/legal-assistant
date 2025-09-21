import React, { useState } from "react";
import Navbar from "../components/navbar";
import UploadBox from "../components/UploadBox";
import InputFields from "../components/InputField";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState("Client");
  const [jurisdiction] = useState("India");

  const handleFileChange = (uploadedFile) => {
    setFile(uploadedFile);
    setStatus(uploadedFile ? `Selected file: ${uploadedFile.name}` : "No file selected");
  };

  const handleDemystify = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const BASE_URL = import.meta.env.VITE_API_URL
    try {
      
      const res = await fetch(`${BASE_URL}/api/parse`, {
        method: "POST",
        body: formData,
      });
      const parsedData = await res.json();

      const summaryRes = await fetch(`${BASE_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted_text: parsedData.extracted_text }),
      });
      const summaryData = await summaryRes.json();

      localStorage.setItem("summary", JSON.stringify(summaryData));

      // Send to /api/negotiation with role, jurisdiction, and parsed text
      const negotiationRes = await fetch(`${BASE_URL}/api/negotiation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, jurisdiction, text: parsedData.extracted_text }),
      });
      const negotiationData = await negotiationRes.json();
      localStorage.setItem("negotiation_analysis", JSON.stringify(negotiationData));

      navigate("/demystified", { state: { parsed: parsedData, summary: summaryData } });
    } catch (err) {
      console.error("Error during parsing/summarizing:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-6 p-10">
        <div className="flex gap-6 w-full max-w-4xl">
          <UploadBox onFileChange={handleFileChange} status = {status}/>
          <InputFields role={role} setRole={setRole} jurisdiction={jurisdiction}/>
        </div>
        <button
          className="bg-accentGreen px-6 py-3 rounded-full text-darkGreen font-bold shadow-glow hover:scale-105 transition"
          onClick={handleDemystify}
          disabled={loading || !file}
        >
          {loading ? "Processing..." : "Demystify!"}
        </button>
      </div>
    </div>
  );
}
