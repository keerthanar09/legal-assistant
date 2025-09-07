import React from 'react';
import Sidebar from '../components/Sidebar';
import DocumentViewer from '../components/DocumentViewer';
import Navbar from '../components/navbar';
export default function AfterUpload() {
  return (
    <div className=" flex flex-col">
        <Navbar />
      <div className="flex flex-row gap-6 p-10 max-h-screen w-full">
        <Sidebar />
        <DocumentViewer />
      </div>
    </div>
  );
}