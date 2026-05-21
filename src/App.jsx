import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./Context/CartContext";
import HomePage from "./pages/HomePage";
import Ndeshjet from "./pages/Ndeshjet";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Preferences from "./pages/Preferences";
import SectorPage from "./pages/BuyTicketsPage/SectorPage";
import SeatsPage from "./pages/BuyTicketsPage/SeatsPage";
import CartPage from "./pages/BuyTicketsPage/CartPage";
import ConfirmationPage from "./pages/BuyTicketsPage/ConfirmationPage";
import ProfilePage from "./pages/ProfilePages/ProfilePage";
import Store from "./pages/Store";
import Dashboard from "./pages/Dashboard/Dashboard";
import Staff from "./pages/Dashboard/Staff";
import Players from "./Players";
import DashboardNdeshjet from "./pages/Dashboard/DashboardNdeshjet";
import DashboardStore from "./pages/Dashboard/DashboardStore";
import DashboardPlayers from "./pages/Dashboard/DashboardPlayers";
import StoreConfirmation from "./pages/StoreConfirmation";
import Lajmet from "./pages/Lajmet";
import Training from "./pages/Dashboard/Trainings";
import DashboardDemtimet from "./pages/Dashboard/DashboardDemtimet";

function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("accessToken");
  const role  = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "Admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/ndeshjet"          element={<Ndeshjet />} />
          <Route path="/players"           element={<Players />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/preferences"       element={<Preferences />} />
          <Route path="/lajmet"            element={<Lajmet />} />
          <Route path="/Store"             element={<Store />} />
          <Route path="/StoreConfirmation" element={<StoreConfirmation />} />
          <Route path="/SectorPage/:matchId"           element={<SectorPage />} />
          <Route path="/SeatsPage/:matchId/:sectorId"  element={<SeatsPage />} />
          <Route path="/CartPage"          element={<CartPage />} />
          <Route path="/ConfirmationPage"  element={<ConfirmationPage />} />

          <Route path="/ProfilePage"       element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/dashboard"         element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
          <Route path="/staff"             element={<PrivateRoute adminOnly><Staff /></PrivateRoute>} />
          <Route path="/dashboardNdeshjet" element={<PrivateRoute adminOnly><DashboardNdeshjet /></PrivateRoute>} />
          <Route path="/DashboardStore"    element={<PrivateRoute adminOnly><DashboardStore /></PrivateRoute>} />
          <Route path="/DashboardPlayers"  element={<PrivateRoute adminOnly><DashboardPlayers /></PrivateRoute>} />
          <Route path="/injuries"          element={<PrivateRoute adminOnly><DashboardDemtimet /></PrivateRoute>} />
          <Route path="/training"          element={<PrivateRoute adminOnly><Training /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
