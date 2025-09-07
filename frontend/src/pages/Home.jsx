import React from "react";
import Navbar from "../components/navbar";
import UploadBox from "../components/UploadBox";
import InputFields from "../components/InputField";
export default function Home(){
    return <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-6 p-10">
        <div className="flex gap-6 w-full max-w-4xl">
          <UploadBox />
          <InputFields />
        </div>
        <button className="bg-accentGreen px-6 py-3 rounded-full text-darkGreen font-bold shadow-glow hover:scale-105 transition">
          Demystify!
        </button>
      </div>

      
    </div>;
}