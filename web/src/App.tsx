import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router"; // Jika error, ganti "react-router" menjadi "react-router-dom"

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
import TransactionVerification from "./components/transactionVerification";
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
              <Route path="/events/:id" element={<EventDetailCustomer />} />
              <Route path="/checkout/:id" element={<TicketPurchase />} />
              <Route path="/promotions" element={<Promotions />} />
              {/* NESTED ROUTES DASHBOARD */}
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardOverview />} />{" "}
                {/* /dashboard */}
                <Route
                  path="transactions"
                  element={<TransactionsOrganizer />}
                />{" "}
                <Route
                  path="transactions/:id"
                  element={<TransactionVerification />}
                />{" "}
                <Route path="events" element={<MyEvents />} />
                <Route path="events/edit/:id" element={<EventDetail />} />
                <Route path="attendees" element={<Attendees />} />
                <Route path="reports" element={<Reports />} />
                <Route path="create-event" element={<CreateEvent />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />{" "}
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}
