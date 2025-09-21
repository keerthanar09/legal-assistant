import React, { useState } from "react";
import Navbar from "../components/navbar";
import UploadBox from "../components/UploadBox";
import InputFields from "../components/InputField";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (uploadedFile) => {
    setFile(uploadedFile);
  };

  const handleDemystify = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/parse", {
        method: "POST",
        body: formData,
      });
      const parsedData = await res.json();

      const summaryRes = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted_text: parsedData.extracted_text }),
      });
      const summaryData = await summaryRes.json();

      localStorage.setItem("summary", JSON.stringify(summaryData));
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
          <UploadBox onFileChange={handleFileChange} />
          <InputFields />
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
