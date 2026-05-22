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
import DashboardBiletat  from "./pages/Dashboard/DashboardBiletat";

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
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />

          <Route path="/"                  element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/ndeshjet"          element={<PrivateRoute><Ndeshjet /></PrivateRoute>} />
          <Route path="/players"           element={<PrivateRoute><Players /></PrivateRoute>} />
          <Route path="/preferences"       element={<PrivateRoute><Preferences /></PrivateRoute>} />
          <Route path="/lajmet"            element={<PrivateRoute><Lajmet /></PrivateRoute>} />
          <Route path="/Store"             element={<PrivateRoute><Store /></PrivateRoute>} />
          <Route path="/StoreConfirmation" element={<PrivateRoute><StoreConfirmation /></PrivateRoute>} />
          <Route path="/SectorPage/:matchId"           element={<PrivateRoute><SectorPage /></PrivateRoute>} />
          <Route path="/SeatsPage/:matchId/:sectorId"  element={<PrivateRoute><SeatsPage /></PrivateRoute>} />
          <Route path="/CartPage"          element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/ConfirmationPage"  element={<PrivateRoute><ConfirmationPage /></PrivateRoute>} />
          <Route path="/ProfilePage"       element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          <Route path="/dashboard"         element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
          <Route path="/staff"             element={<PrivateRoute adminOnly><Staff /></PrivateRoute>} />
          <Route path="/dashboardNdeshjet" element={<PrivateRoute adminOnly><DashboardNdeshjet /></PrivateRoute>} />
          <Route path="/DashboardStore"    element={<PrivateRoute adminOnly><DashboardStore /></PrivateRoute>} />
          <Route path="/DashboardPlayers"  element={<PrivateRoute adminOnly><DashboardPlayers /></PrivateRoute>} />
          <Route path="/injuries"          element={<PrivateRoute adminOnly><DashboardDemtimet /></PrivateRoute>} />
          <Route path="/training"          element={<PrivateRoute adminOnly><Training /></PrivateRoute>} />
          <Route path="/DashboardBiletat"  element={<PrivateRoute adminOnly><DashboardBiletat /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
