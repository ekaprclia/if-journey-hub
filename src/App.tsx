import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Insight from "./pages/Insight";
import WeeklyDashboard from "./pages/WeeklyDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import { getLoggedInUser } from "@/lib/storage";

const queryClient = new QueryClient();

/* ================= PUBLIC ROUTE (ANTI LOGIN ULANG) ================= */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = getLoggedInUser();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ================= APP ================= */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* ================= PUBLIC ================= */}
            <Route path="/" element={<Index />} />

            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* ================= PROTECTED ================= */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/insight"
              element={
                <ProtectedRoute>
                  <Insight />
                </ProtectedRoute>
              }
            />

            <Route
              path="/weekly"
              element={
                <ProtectedRoute>
                  <WeeklyDashboard />
                </ProtectedRoute>
              }
            />

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
