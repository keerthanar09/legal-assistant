import React, { useRef } from "react";
import { Upload } from 'lucide-react';

export default function UploadBox({ onFileChange }) {
  const fileInputRef = useRef();

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="card p-8 items-center justify-center h-64">
      <p className="mb-4 text-center">UPLOAD YOUR LEGAL DOCUMENT HERE</p>
      <div className="border-2 border-dashed border-accentGreen w-24 h-24 flex items-center justify-center rounded-lg cursor-pointer">
        <button
          type="button"
          onClick={handleIconClick}
          aria-label="Upload Document"
        >
          <Upload color="white" size={50} />
        </button>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png, .txt, .docx"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      <p className="mt-2 text-sm">Click here to upload</p>
    </div>
  );
}
