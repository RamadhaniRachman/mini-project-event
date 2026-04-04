import { BrowserRouter as Router, Routes, Route } from "react-router";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

// Buat komponen Home sementara (atau import dari pages/home jika sudah ada)
const Home = () => (
  <div className="min-h-screen bg-charcoal flex justify-center items-center text-white font-headline text-2xl">
    Ini Halaman Beranda (Customer)
  </div>
);

export default function App() {
  return (
    <>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}
