import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-6">
        <h1 className="heading-lg">Settings</h1>
        <p className="text-muted-300 max-w-2xl mx-auto">
          Manage your account settings, preferences, and integrations (Coming Soon)
        </p>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>⚙️ Under Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-300 mb-4">
              User preferences, theme settings, API configurations, and account management features are being developed.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
