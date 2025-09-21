import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Layout components
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SchemaPreview = lazy(() => import("./pages/SchemaPreview"));
const FlowSelector = lazy(() => import("./pages/FlowSelector"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FormBuilder = lazy(() => import("./pages/FormBuilder"));

const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-bg-900 flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Layout wrapper with sidebar
const AppLayout = ({ children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-bg-900 text-foreground">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={showSidebar}
      />

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <AnimatePresence>
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </AnimatePresence>
        )}

        {/* Main content */}
        <main
          className={`
          flex-1 transition-all duration-300 ease-out
          ${showSidebar ? "lg:ml-64" : ""}
        `}
        >
          <div className="container mx-auto px-4 py-6 min-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Sidebar overlay for mobile */}
      {showSidebar && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Landing layout (no sidebar)
const LandingLayout = ({ children }) => (
  <div className="min-h-screen bg-bg-900 text-foreground">{children}</div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing page - no layout */}
                <Route
                  path="/"
                  element={
                    <LandingLayout>
                      <LandingPage />
                    </LandingLayout>
                  }
                />

                {/* Schema preview - minimal layout */}
                <Route
                  path="/preview"
                  element={
                    <AppLayout showSidebar={false}>
                      <SchemaPreview />
                    </AppLayout>
                  }
                />

                {/* Flow selector - minimal layout */}
                <Route
                  path="/flow"
                  element={
                    <AppLayout showSidebar={false}>
                      <FlowSelector />
                    </AppLayout>
                  }
                />

                {/* Dashboard and app routes - full layout */}
                <Route
                  path="/dashboard"
                  element={
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  }
                />

                <Route
                  path="/forms/new"
                  element={
                    <AppLayout>
                      <FormBuilder />
                    </AppLayout>
                  }
                />

                <Route
                  path="/forms/:id/edit"
                  element={
                    <AppLayout>
                      <FormBuilder />
                    </AppLayout>
                  }
                />

                <Route
                  path="/forms/:id/analytics"
                  element={
                    <AppLayout>
                      <Analytics />
                    </AppLayout>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  }
                />

                {/* Redirect unknown routes to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgba(14, 23, 36, 0.95)",
                  color: "#e2e8f0",
                  border: "1px solid rgba(124, 92, 255, 0.2)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  fontSize: "14px",
                  fontWeight: "500",
                },
                success: {
                  iconTheme: {
                    primary: "#22c55e",
                    secondary: "#ffffff",
                  },
                  style: {
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ff6b6b",
                    secondary: "#ffffff",
                  },
                  style: {
                    border: "1px solid rgba(255, 107, 107, 0.3)",
                  },
                },
                loading: {
                  iconTheme: {
                    primary: "#7C5CFF",
                    secondary: "#ffffff",
                  },
                  style: {
                    border: "1px solid rgba(124, 92, 255, 0.3)",
                  },
                },
              }}
            />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
              {/* Gradient orbs */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float" />
              <div
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "2s" }}
              />

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(124, 92, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(124, 92, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />
            </div>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
