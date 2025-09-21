import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const FormBuilder = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-6">
        <h1 className="heading-lg">Advanced Form Builder</h1>
        <p className="text-muted-300 max-w-2xl mx-auto">
          Manual form builder for fine-tuning Google Forms schemas (Coming Soon)
        </p>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Google Forms Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-300 mb-4">
              Manual Google Forms schema builder is under development. Use the
              AI Generator to create forms instantly.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormBuilder;
