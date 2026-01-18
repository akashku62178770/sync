import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";

// Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import IssuesPage from "./pages/issues/IssuesPage";
import InsightDetailPage from "./pages/issues/InsightDetailPage";
import HistoryPage from "./pages/history/HistoryPage";
import IntegrationsPage from "./pages/integrations/IntegrationsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          
          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          
          {/* Dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/issues/:id" element={<InsightDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
