import About from "./pages/About";
import AfterUpload from "./pages/AfterUpload";
import Home from "./pages/Home";
import SummarizePage from "./pages/SummarizePage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
     <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demystified" element={<AfterUpload />} />
          <Route path="/about" element={<About />} />
          <Route path="/summary" element={<SummarizePage />} />
        </Routes>
      </Router>
    </div>
  );
}
