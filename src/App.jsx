import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./Context/CartContext";

const HomePage          = lazy(() => import("./pages/HomePage"));
const Ndeshjet          = lazy(() => import("./pages/Ndeshjet"));
const Login             = lazy(() => import("./pages/Login"));
const Register          = lazy(() => import("./pages/Register"));
const Preferences       = lazy(() => import("./pages/Preferences"));
const SectorPage        = lazy(() => import("./pages/BuyTicketsPage/SectorPage"));
const SeatsPage         = lazy(() => import("./pages/BuyTicketsPage/SeatsPage"));
const CartPage          = lazy(() => import("./pages/BuyTicketsPage/CartPage"));
const ConfirmationPage  = lazy(() => import("./pages/BuyTicketsPage/ConfirmationPage"));
const ProfilePage       = lazy(() => import("./pages/ProfilePages/ProfilePage"));
const Store             = lazy(() => import("./pages/Store"));
const Dashboard         = lazy(() => import("./pages/Dashboard/Dashboard"));
const Staff             = lazy(() => import("./pages/Dashboard/Staff"));
const Players           = lazy(() => import("./Players"));
const DashboardNdeshjet = lazy(() => import("./pages/Dashboard/DashboardNdeshjet"));
const DashboardStore    = lazy(() => import("./pages/Dashboard/DashboardStore"));
const DashboardPlayers  = lazy(() => import("./pages/Dashboard/DashboardPlayers"));
const StoreConfirmation = lazy(() => import("./pages/StoreConfirmation"));
const Lajmet            = lazy(() => import("./pages/Lajmet"));
const Training          = lazy(() => import("./pages/Dashboard/Trainings"));
const DashboardDemtimet = lazy(() => import("./pages/Dashboard/DashboardDemtimet"));
const DashboardBiletat  = lazy(() => import("./pages/Dashboard/DashboardBiletat"));
const DashboardProfile  = lazy(() => import("./pages/Dashboard/DashboardProfile"));
const DashboardSezone   = lazy(() => import("./pages/Dashboard/DashboardSezone"));
const SeasonArchive     = lazy(() => import("./pages/SeasonArchive"));

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
        <Suspense fallback={<div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"#0a0a0a", color:"#fff" }}>Duke ngarkuar...</div>}>
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
          <Route path="/DashboardBiletat"   element={<PrivateRoute adminOnly><DashboardBiletat /></PrivateRoute>} />
          <Route path="/DashboardProfile"  element={<PrivateRoute adminOnly><DashboardProfile /></PrivateRoute>} />
          <Route path="/seasons"           element={<PrivateRoute adminOnly><DashboardSezone /></PrivateRoute>} />
          <Route path="/sezonet"           element={<PrivateRoute><SeasonArchive /></PrivateRoute>} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}
