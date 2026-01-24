import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Layouts
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";

// Lazy-loaded Pages
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const IssuesPage = lazy(() => import("./pages/issues/IssuesPage"));
const InsightDetailPage = lazy(() => import("./pages/issues/InsightDetailPage"));
const HistoryPage = lazy(() => import("./pages/history/HistoryPage"));
const IntegrationsPage = lazy(() => import("./pages/integrations/IntegrationsPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const OnboardingPage = lazy(() => import("./pages/onboarding/OnboardingPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const GoogleCallbackPage = lazy(() => import("./pages/auth/GoogleCallbackPage"));
const IntegrationCallbackPage = lazy(() => import("./pages/integrations/IntegrationCallbackPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
            <Route path="/integrations/google/callback" element={<IntegrationCallbackPage />} />
            <Route path="/integrations/meta/callback" element={<IntegrationCallbackPage />} />

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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
