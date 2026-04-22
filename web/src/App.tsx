import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Pastikan menggunakan react-router-dom

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import DashboardOverview from "./components/dashboardOverview";
import TransactionsOrganizer from "./components/transactionOrganizer";
import MyEvents from "./pages/myEvent";
import Reports from "./pages/report";
import Home from "./pages/home";
import CreateEvent from "./components/createEvent";
import EventDetail from "./components/eventDetail";
import Attendees from "./pages/attendees";
import EventDetailCustomer from "./pages/eventDetailCustomer";
import TicketPurchase from "./pages/ticketPurchase";
import Promotions from "./pages/promotions";
import TransactionVerificationOrganizer from "./components/transactionVerificationOrganizer";
import Profile from "./pages/profile";
import Security from "./pages/security";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import TransactionVerificationCustomer from "./components/transactionVerificationCustomer";

export default function App() {
  return (
    <>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex flex-col min-h-screen">
            <Routes>
              {/* Rute Publik & Customer */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/security" element={<Security />} />
              <Route path="/events/:id" element={<EventDetailCustomer />} />
              <Route path="/checkout/:id" element={<TicketPurchase />} />
              <Route path="/promotions" element={<Promotions />} />

              {/* 👇 RUTE UPLOAD BUKTI CUSTOMER (Perhatikan garis miring di awal) */}
              <Route
                path="/transactions/:id"
                element={<TransactionVerificationCustomer />}
              />

              {/* NESTED ROUTES DASHBOARD (ORGANIZER) */}
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardOverview />} />
                <Route
                  path="transactions"
                  element={<TransactionsOrganizer />}
                />

                {/* 👇 Rute Verifikasi Bukti Organizer */}
                <Route
                  path="transactions/:id"
                  element={<TransactionVerificationOrganizer />}
                />

                <Route path="events" element={<MyEvents />} />
                <Route path="events/edit/:id" element={<EventDetail />} />
                <Route path="attendees" element={<Attendees />} />
                <Route path="reports" element={<Reports />} />
                <Route path="create-event" element={<CreateEvent />} />
              </Route>

              {/* Fallback jika URL ngawur */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}
