import { Info } from 'lucide-react';
export default function InputFields() {
  return (
    <div className="card p-6 gap-2">
      <p className="text-center">OTHER REQUIRED DETAILS</p>
      <p className="text-xs text-center">Please enter these details before uploading the document as it helps add context.</p>
      <div className="flex flex-row gap-4 items-center">
        <label className="block">ROLE:</label>
        <input className="w-full p-2 rounded-4xl bg-darkGreen border border-accentGreen" />
        <Info size={20}/>
      </div>
      <div className="flex flex-row gap-4 items-center">
        <label className="block">JURISDICTION:</label>
        <input className="w-full p-2 rounded-4xl bg-darkGreen border border-accentGreen" />
        <Info size={29}/>
      </div>
    </div>
  );
}
