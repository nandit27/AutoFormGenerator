import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { GoogleFormsLoadingSpinner } from "../components/common/LoadingSpinner";
import GoogleAuthTroubleshooter from "../components/GoogleAuthTroubleshooter";
import GoogleFormsService from "../services/googleForms";
import { FORM_FLOWS } from "../types";
import { generateId } from "../utils";

const FlowSelector = () => {
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  useEffect(() => {
    // Load schema from session storage
    const storedSchema = sessionStorage.getItem("generatedSchema");
    if (storedSchema) {
      setSchema(JSON.parse(storedSchema));
    } else {
      // Redirect to landing if no schema
      navigate("/");
    }
  }, [navigate]);

  const handleCreateGoogleForm = async () => {
    setIsCreating(true);
    const loadingToast = toast.loading(
      "Setting up Google Forms integration...",
    );

    try {
      // Clear any previous errors
      setAuthError(null);

      // Check if already authenticated
      if (!GoogleFormsService.isAuthenticated()) {
        setIsAuthenticating(true);
        toast.dismiss(loadingToast);
        const authToast = toast.loading("Authenticating with Google...");

        await GoogleFormsService.authenticate();

        toast.dismiss(authToast);
        toast.success("Authentication successful!");
        setIsAuthenticating(false);
      }

      // Validate schema for Google Forms
      const validationErrors = GoogleFormsService.validateSchema(schema);
      if (validationErrors.length > 0) {
        toast.dismiss(loadingToast);
        toast.error(`Schema validation failed: ${validationErrors[0]}`);
        setIsCreating(false);
        return;
      }

      // Adapt schema if needed
      const adaptedSchema =
        GoogleFormsService.adaptSchemaForGoogleForms(schema);

      toast.dismiss(loadingToast);
      const creationToast = toast.loading("Creating Google Form...");

      // Create the form
      const createdForm = await GoogleFormsService.createForm(adaptedSchema);

      // Store form details
      const formRecord = {
        id: generateId(),
        schema: adaptedSchema,
        flow: FORM_FLOWS.GOOGLE,
        google_form_id: createdForm.formId,
        responder_uri: createdForm.responderUri,
        edit_url: createdForm.editUrl,
        status: createdForm.status,
        created_at: createdForm.createdAt,
        updated_at: createdForm.createdAt,
        analytics: {
          views: 0,
          submissions: 0,
          conversion_rate: 0,
        },
      };

      // Store in localStorage (in production, this would go to a database)
      const existingForms = JSON.parse(localStorage.getItem("userForms")) || [];
      existingForms.unshift(formRecord);
      localStorage.setItem("userForms", JSON.stringify(existingForms));

      // Clear schema from session storage
      sessionStorage.removeItem("generatedSchema");

      toast.dismiss(creationToast);
      toast.success(
        "Google Form created successfully! You can now edit and share it.",
        { duration: 5000 },
      );

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Forms creation error:", error);
      toast.dismiss(loadingToast);

      // Check if it's an authentication error
      if (
        error.message?.includes("authentication") ||
        error.message?.includes("auth")
      ) {
        setAuthError(error.message);
        setShowTroubleshooter(true);
        toast.error("Authentication failed. Please try again.");
      } else {
        toast.error(
          error.message || "Failed to create Google Form. Please try again.",
        );
      }

      setIsCreating(false);
      setIsAuthenticating(false);
    }
  };

  const handleRetry = () => {
    setShowTroubleshooter(false);
    setAuthError(null);
    handleCreateGoogleForm();
  };

  const handleGoBack = () => {
    navigate("/");
  };

  if (!schema) {
    return (
      <div className="min-h-screen bg-bg-900 flex items-center justify-center">
        <GoogleFormsLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-900 text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="heading-xl mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Create Your Google Form
          </motion.h1>
          <motion.p
            className="text-lg text-muted-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your AI-generated schema is ready! Click below to create a real
            Google Form in your Google account.
          </motion.p>
        </div>

        {/* Authentication Troubleshooter */}
        {showTroubleshooter && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GoogleAuthTroubleshooter
              error={authError}
              onRetry={handleRetry}
              onGoBack={handleGoBack}
            />
          </motion.div>
        )}

        {/* Schema Preview */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-bg-800/50 border-border-200/20">
            <CardHeader>
              <CardTitle className="text-xl text-primary-400">
                Generated Form Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {schema.title}
                </h3>
                <p className="text-muted-300 text-sm">{schema.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-200 mb-2">
                  Fields: {schema.fields?.length || 0}
                </p>
                <div className="flex flex-wrap gap-2">
                  {schema.fields?.slice(0, 5).map((field, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-md border border-primary-500/20"
                    >
                      {field.label}
                    </span>
                  ))}
                  {schema.fields?.length > 5 && (
                    <span className="px-2 py-1 bg-muted-500/10 text-muted-400 text-xs rounded-md">
                      +{schema.fields.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Google Forms Option */}
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:from-blue-500/15 hover:to-blue-600/15 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-blue-400 mb-2">
                Create Google Form
              </CardTitle>
              <p className="text-muted-300">
                Generate a real Google Form in your Google account with OAuth
                authentication
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Features:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-green-400">
                    <span className="mr-2">✅</span>
                    Real Google Form in your account
                  </li>
                  <li className="flex items-center text-green-400">
                    <span className="mr-2">✅</span>
                    Automatic response collection
                  </li>
                  <li className="flex items-center text-green-400">
                    <span className="mr-2">✅</span>
                    Google Sheets integration
                  </li>
                  <li className="flex items-center text-green-400">
                    <span className="mr-2">✅</span>
                    Built-in sharing options
                  </li>
                  <li className="flex items-center text-yellow-400">
                    <span className="mr-2">⚠️</span>
                    Google Forms design limitations
                  </li>
                  <li className="flex items-center text-red-400">
                    <span className="mr-2">❌</span>
                    No payment integration
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Benefits:</h4>
                <ul className="text-sm text-muted-300 space-y-1">
                  <li>• Free Google account integration</li>
                  <li>• Familiar Google interface</li>
                  <li>• Reliable data collection</li>
                  <li>• Easy sharing and collaboration</li>
                </ul>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateGoogleForm}
                disabled={isCreating || isAuthenticating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                size="lg"
              >
                {isAuthenticating ? (
                  <>
                    <GoogleFormsLoadingSpinner className="w-5 h-5 mr-2" />
                    Authenticating...
                  </>
                ) : isCreating ? (
                  <>
                    <GoogleFormsLoadingSpinner className="w-5 h-5 mr-2" />
                    Creating Google Form...
                  </>
                ) : (
                  <>
                    Create Google Form
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </Button>

              {/* Note */}
              <p className="text-xs text-muted-400 text-center">
                You&apos;ll be redirected to Google to authenticate and create
                your form
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={handleGoBack}
            disabled={isCreating || isAuthenticating}
            className="px-6"
          >
            ← Back to Generator
          </Button>
        </motion.div>

        {/* Loading Overlay */}
        {(isCreating || isAuthenticating) && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 max-w-sm mx-4 text-center">
              <GoogleFormsLoadingSpinner size="lg" className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isAuthenticating ? "Authenticating..." : "Creating Form..."}
              </h3>
              <p className="text-muted-300 text-sm">
                {isAuthenticating
                  ? "Please complete the Google authentication process"
                  : "This may take a few moments"}
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlowSelector;
