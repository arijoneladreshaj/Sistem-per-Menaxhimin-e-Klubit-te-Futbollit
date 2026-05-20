import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./Context/CartContext";
import Navbar from "./components/NavBar";
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



export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
     
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ndeshjet" element={<Ndeshjet />} />
          <Route path="/players" element={<Players />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/SectorPage/:matchId" element={<SectorPage />} />
          <Route path="/SeatsPage/:matchId/:sectorId" element={<SeatsPage />} />
          <Route path="/CartPage" element={<CartPage />} />
          <Route path="/ConfirmationPage" element={<ConfirmationPage />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/ProfilePage" element={<ProfilePage />} />
          <Route path="/Store" element={<Store />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/dashboardNdeshjet" element={<DashboardNdeshjet />}/>
          <Route path="/StoreConfirmation" element={<StoreConfirmation />} />
          <Route path="/DashboardStore" element={<DashboardStore/>} />
          <Route path="/DashboardPlayers" element={<DashboardPlayers />} />
           <Route path="/lajmet" element={<Lajmet />} />
           <Route path="/training" element={<Training />} />
          <Route path="/injuries" element={<DashboardDemtimet />} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
