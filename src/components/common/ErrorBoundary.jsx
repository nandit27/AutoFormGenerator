import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    if (import.meta.env?.MODE === "production") {
      // Log to error tracking service (e.g., Sentry, LogRocket, etc.)
      // errorTrackingService.captureException(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-bg-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card variant="glass" className="text-center">
              <CardContent className="pt-6">
                {/* Error Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 mb-4 bg-danger-400/10 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-danger-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </motion.div>

                {/* Error Message */}
                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Oops! Something went wrong
                  </h2>
                  <p className="text-sm text-muted-300">
                    We encountered an unexpected error. Don't worry, our team
                    has been notified.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={this.handleReload}
                      className="flex-1"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reload Page
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleGoHome}
                      className="flex-1"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Go Home
                    </Button>
                  </div>

                  {/* Show Details Button */}
                  {import.meta.env?.MODE === "development" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.toggleDetails}
                      className="w-full text-xs"
                    >
                      {this.state.showDetails ? "Hide" : "Show"} Error Details
                      <svg
                        className={`w-3 h-3 ml-2 transition-transform ${
                          this.state.showDetails ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Button>
                  )}
                </div>

                {/* Error Details (Development Only) */}
                {import.meta.env?.MODE === "development" &&
                  this.state.showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-3 bg-surface-800/50 rounded-lg text-left"
                    >
                      <h4 className="text-xs font-semibold text-danger-400 mb-2 uppercase tracking-wider">
                        Error Details
                      </h4>
                      <div className="text-xs text-muted-300 space-y-2">
                        <div>
                          <span className="font-medium">Error:</span>
                          <pre className="mt-1 whitespace-pre-wrap break-words">
                            {this.state.error && this.state.error.toString()}
                          </pre>
                        </div>
                        {this.state.errorInfo && (
                          <div>
                            <span className="font-medium">Stack Trace:</span>
                            <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                {/* Contact Support */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-300">
                    Need help?{" "}
                    <a
                      href="/contact"
                      className="text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Contact Support
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

// Functional wrapper for hook-based components
export const ErrorBoundaryWrapper = ({ children, fallback }) => {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};

// Simple error fallback component
export const SimpleErrorFallback = ({ error, resetError }) => (
  <div className="min-h-[200px] flex items-center justify-center p-4">
    <Card variant="outline" className="text-center max-w-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto bg-danger-400/10 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-danger-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-300">
              Please try again or contact support if the problem persists.
            </p>
          </div>
          {resetError && (
            <Button variant="outline" size="sm" onClick={resetError}>
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ErrorBoundary;
