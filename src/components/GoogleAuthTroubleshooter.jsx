import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const GoogleAuthTroubleshooter = ({ error, onRetry, onGoBack }) => {
  const commonIssues = [
    {
      title: "Popup Blocked",
      description: "Your browser might be blocking the Google authentication popup.",
      solutions: [
        "Check your browser's popup blocker settings",
        "Allow popups for this site",
        "Try using a different browser"
      ]
    },
    {
      title: "Third-party Cookies Disabled",
      description: "Google OAuth requires third-party cookies to be enabled.",
      solutions: [
        "Enable third-party cookies in browser settings",
        "Add Google domains to your allowed sites",
        "Disable strict tracking protection temporarily"
      ]
    },
    {
      title: "Network Issues",
      description: "Connection problems can interrupt the authentication flow.",
      solutions: [
        "Check your internet connection",
        "Try refreshing the page",
        "Disable VPN if you're using one"
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-danger-500/10 border-danger-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-danger-400">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-danger-500/5 border border-danger-500/20 rounded-lg p-4">
              <p className="text-sm text-danger-300">{error}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-danger-500/30 text-danger-400 hover:bg-danger-500/10"
            >
              Try Again
            </Button>
            <Button
              onClick={onGoBack}
              variant="ghost"
              className="text-muted-300"
            >
              Go Back
            </Button>
          </div>

          {/* Troubleshooting Guide */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Common Issues & Solutions:</h4>
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="border border-border-200/20 rounded-lg p-4">
                  <h5 className="font-medium text-foreground mb-2">{issue.title}</h5>
                  <p className="text-sm text-muted-300 mb-3">{issue.description}</p>
                  <ul className="space-y-1">
                    {issue.solutions.map((solution, sIndex) => (
                      <li key={sIndex} className="text-sm text-muted-200 flex items-start">
                        <span className="text-primary-400 mr-2">•</span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Help */}
          <div className="bg-bg-800/50 border border-border-200/20 rounded-lg p-4">
            <h5 className="font-medium text-foreground mb-2">Still Having Issues?</h5>
            <div className="space-y-2 text-sm text-muted-300">
              <p>• Make sure you&apos;re signed into your Google account</p>
              <p>• Clear your browser cache and cookies</p>
              <p>• Try using an incognito/private browsing window</p>
              <p>• Ensure JavaScript is enabled in your browser</p>
            </div>
          </div>

          {/* Environment Info */}
          <details className="text-xs text-muted-400">
            <summary className="cursor-pointer hover:text-muted-200">
              Show technical details
            </summary>
            <div className="mt-2 p-3 bg-bg-800/30 rounded border font-mono">
              <p>Error: {error || 'Unknown authentication error'}</p>
              <p>URL: {window.location.href}</p>
              <p>User Agent: {navigator.userAgent.substring(0, 100)}...</p>
              <p>Timestamp: {new Date().toISOString()}</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoogleAuthTroubleshooter;
