import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Ndeshjet from "./pages/Ndeshjet";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Preferences from "./pages/Preferences";
import SectorPage from "./pages/SectorPage";

import Store from "./pages/Store"

import Dashboard from "./pages/Dashboard";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ndeshjet" element={<Ndeshjet />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/SectorPage/:matchId" element={<SectorPage />} />

        <Route path="/Store" element={<Store />} />

        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}
