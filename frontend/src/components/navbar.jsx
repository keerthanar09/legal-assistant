import { User } from 'lucide-react';
export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4">
      <span className="text-lg">
        <a href = "/about">About</a>
      </span>
      <h1 className="text-6xl font-bold italic">LEGAL ASSISTANT</h1>
      <div className="flex items-center gap-3 font-light">
        <span>Logout</span>
        <div className="w-8 h-8 rounded-full bg-accentGreen flex items-center justify-center">
          <User size = {25} color="white"/>
        </div>
      </div>
    </nav>
  );
}

