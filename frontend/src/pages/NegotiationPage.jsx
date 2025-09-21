import Sidebar from '../components/Sidebar';
import NegotiationViewer from '../components/Negotiation/NegotiationViewer';
import Navbar from '../components/navbar';
export default function SummarizePage() {
  return (
    <div className=" flex flex-col">
        <Navbar />
      <div className="flex flex-row gap-6 p-10 max-h-screen w-full">
        <Sidebar />
        <NegotiationViewer />
      </div>
    </div>
  );
}