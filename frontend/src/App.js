import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DonationSuccess from "@/pages/DonationSuccess";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
