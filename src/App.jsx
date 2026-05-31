import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./Context/CartContext";
import FooterLayout from "./Components/FooterLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const Ndeshjet = lazy(() => import("./pages/Ndeshjet"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Preferences = lazy(() => import("./pages/Preferences"));
const SectorPage = lazy(() => import("./pages/BuyTicketsPage/SectorPage"));
const SeatsPage = lazy(() => import("./pages/BuyTicketsPage/SeatsPage"));
const CartPage = lazy(() => import("./pages/BuyTicketsPage/CartPage"));
const ConfirmationPage = lazy(
  () => import("./pages/BuyTicketsPage/ConfirmationPage"),
);
const ProfilePage = lazy(() => import("./pages/ProfilePages/ProfilePage"));
const Store = lazy(() => import("./pages/Store"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Staff = lazy(() => import("./pages/Dashboard/Staff"));
const Players = lazy(() => import("./pages/Players"));
const DashboardNdeshjet = lazy(
  () => import("./pages/Dashboard/DashboardNdeshjet"),
);
const DashboardStore = lazy(() => import("./pages/Dashboard/DashboardStore"));
const DashboardPlayers = lazy(
  () => import("./pages/Dashboard/DashboardPlayers"),
);
const StoreConfirmation = lazy(() => import("./pages/StoreConfirmation"));
const Lajmet = lazy(() => import("./pages/Lajmet"));
const Training = lazy(() => import("./pages/Dashboard/Trainings"));
const DashboardDemtimet = lazy(
  () => import("./pages/Dashboard/DashboardDemtimet"),
);
const DashboardBiletat = lazy(
  () => import("./pages/Dashboard/DashboardBiletat"),
);
const DashboardProfile = lazy(
  () => import("./pages/Dashboard/DashboardProfile"),
);

const DashboardSezone = lazy(() => import("./pages/Dashboard/DashboardSezone"));
const SeasonArchive = lazy(() => import("./pages/SeasonArchive"));

const DashboardUsers        = lazy(() => import("./pages/Dashboard/DashboardUsers"));
const DashboardKontratat    = lazy(() => import("./pages/Dashboard/DashboardKontratat"));
const DashboardTransferimet = lazy(() => import("./pages/Dashboard/DashboardTransferimet"));
const NotificationsPage     = lazy(() => import("./pages/NotificationsPage"));
const LineupPage            = lazy(() => import("./pages/Dashboard/LineupPage"));
const PublicLineupPage      = lazy(() => import("./pages/PublicLineupPage"));
const DashboardMessages     = lazy(() => import("./pages/Dashboard/DashboardMessages"));
const DashboardClubs        = lazy(() => import("./pages/Dashboard/DashboardClubs"));
const PaymentPage           = lazy(() => import("./pages/BuyTicketsPage/PaymentPage"));
const StorePaymentPage      = lazy(() => import("./pages/StorePaymentPage"));

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("accessToken");
  const role = (localStorage.getItem("role") || "").toLowerCase();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.map((r) => r.toLowerCase()).includes(role))
    return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#0a0a0a",
                color: "#fff",
              }}
            >
              Duke ngarkuar...
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<PrivateRoute><FooterLayout><HomePage /></FooterLayout></PrivateRoute>} />
            <Route path="/ndeshjet" element={<PrivateRoute><FooterLayout><Ndeshjet /></FooterLayout></PrivateRoute>} />
            <Route path="/players" element={<PrivateRoute><FooterLayout><Players /></FooterLayout></PrivateRoute>} />
            <Route path="/preferences" element={<PrivateRoute><FooterLayout><Preferences /></FooterLayout></PrivateRoute>} />
            <Route path="/lajmet" element={<PrivateRoute><FooterLayout><Lajmet /></FooterLayout></PrivateRoute>} />
            <Route path="/Store" element={<PrivateRoute><FooterLayout><Store /></FooterLayout></PrivateRoute>} />
            <Route path="/StoreConfirmation" element={<PrivateRoute><FooterLayout><StoreConfirmation /></FooterLayout></PrivateRoute>} />
            <Route path="/StorePaymentPage" element={<PrivateRoute><FooterLayout><StorePaymentPage /></FooterLayout></PrivateRoute>} />
            <Route path="/SectorPage/:matchId" element={<PrivateRoute><FooterLayout><SectorPage /></FooterLayout></PrivateRoute>} />
            <Route path="/SeatsPage/:matchId/:sectorId" element={<PrivateRoute><FooterLayout><SeatsPage /></FooterLayout></PrivateRoute>} />
            <Route path="/CartPage" element={<PrivateRoute><FooterLayout><CartPage /></FooterLayout></PrivateRoute>} />
            <Route path="/PaymentPage" element={<PrivateRoute><FooterLayout><PaymentPage /></FooterLayout></PrivateRoute>} />
            <Route path="/ConfirmationPage" element={<PrivateRoute><FooterLayout><ConfirmationPage /></FooterLayout></PrivateRoute>} />
            <Route path="/ProfilePage" element={<PrivateRoute><FooterLayout><ProfilePage /></FooterLayout></PrivateRoute>} />
            <Route path="/sezonet" element={<PrivateRoute><FooterLayout><SeasonArchive /></FooterLayout></PrivateRoute>} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["Admin", "Trajner", "Menaxher"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <PrivateRoute roles={["Admin"]}>
                  <Staff />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboardNdeshjet"
              element={
                <PrivateRoute roles={["Admin"]}>
                  <DashboardNdeshjet />
                </PrivateRoute>
              }
            />
            <Route
              path="/DashboardStore"
              element={
                <PrivateRoute roles={["Admin", "Menaxher"]}>
                  <DashboardStore />
                </PrivateRoute>
              }
            />
            <Route
              path="/DashboardPlayers"
              element={
                <PrivateRoute roles={["Admin", "Trajner"]}>
                  <DashboardPlayers />
                </PrivateRoute>
              }
            />
            <Route
              path="/injuries"
              element={
                <PrivateRoute roles={["Admin", "Trajner"]}>
                  <DashboardDemtimet />
                </PrivateRoute>
              }
            />
            <Route
              path="/training"
              element={
                <PrivateRoute roles={["Admin", "Trajner"]}>
                  <Training />
                </PrivateRoute>
              }
            />
            <Route
              path="/DashboardBiletat"
              element={
                <PrivateRoute roles={["Admin", "Menaxher"]}>
                  <DashboardBiletat />
                </PrivateRoute>
              }
            />
            <Route
              path="/DashboardProfile"
              element={
                <PrivateRoute roles={["Admin", "Trajner", "Menaxher", "Lojtari"]}>
                  <DashboardProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/DashboardUsers"
              element={
                <PrivateRoute roles={["Admin"]}>
                  <DashboardUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute roles={["Admin"]}>
                  <DashboardMessages />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/lineup"
              element={
                <PrivateRoute roles={["Admin", "Trajner", "Lojtari"]}>
                  <LineupPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/lineup/:matchId"
              element={
                <PrivateRoute>
                  <PublicLineupPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/seasons"
              element={
                <PrivateRoute roles={["Admin"]}>
                  <DashboardSezone />
                </PrivateRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <PrivateRoute roles={["Admin", "Menaxher"]}>
                  <DashboardKontratat />
                </PrivateRoute>
              }
            />
            <Route
              path="/transfers"
              element={
                <PrivateRoute roles={["Admin", "Menaxher"]}>
                  <DashboardTransferimet />
                </PrivateRoute>
              }
            />
            <Route
              path="/clubs"
              element={
                <PrivateRoute roles={["Admin"]}>
                  <DashboardClubs />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}
