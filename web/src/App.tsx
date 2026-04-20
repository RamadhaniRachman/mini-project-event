import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import DashboardOverview from "./components/dashboardOverview";
import Transactions from "./components/transaction";
import MyEvents from "./pages/myEvent";
import Reports from "./pages/report";
import Home from "./pages/home";
import CreateEvent from "./components/createEvent";
import EventDetail from "./components/eventDetail";
import Attendees from "./pages/attendees";
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
              {/* NESTED ROUTES DASHBOARD */}
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardOverview />} />{" "}
                {/* /dashboard */}
                <Route path="transactions" element={<Transactions />} />{" "}
                {/* /dashboard/transactions */}
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
