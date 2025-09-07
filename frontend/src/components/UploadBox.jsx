import { Upload } from 'lucide-react';
export default function UploadBox() {
  return (
    <div className="card p-8 items-center justify-center h-64">
      <p className="mb-4 text-center">UPLOAD YOUR LEGAL DOCUMENT HERE</p>
      <div className="border-2 border-dashed border-accentGreen w-24 h-24 flex items-center justify-center rounded-lg cursor-pointer">
        <Upload color="white" size={50} />
      </div>
      <p className="mt-2 text-sm">Drag and drop file or click here to upload</p>
    </div>
  );
}
