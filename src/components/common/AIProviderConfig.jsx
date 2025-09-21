import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const AIProviderConfig = ({ onProviderChange, currentProvider = "mock" }) => {
  const [config, setConfig] = useState({
    provider: currentProvider,
    apiKey: "",
    model: "",
    endpoint: "",
  });

  const [showConfig, setShowConfig] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const providers = {
    groq: {
      name: "Groq",
      description: "Ultra-fast inference with generous free tier",
      defaultModel: "llama3-8b-8192",
      models: [
        "llama3-8b-8192",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
        "gemma-7b-it",
      ],
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      signupUrl: "https://console.groq.com",
      freeLimit: "6,000 requests/minute",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      color: "text-orange-600",
    },
    gemini: {
      name: "Google Gemini",
      description: "High-quality responses with good free tier",
      defaultModel: "gemini-pro",
      models: ["gemini-pro", "gemini-pro-vision"],
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      signupUrl: "https://aistudio.google.com/app/apikey",
      freeLimit: "15 req/min, 1,500/day",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "text-blue-600",
    },
    huggingface: {
      name: "Hugging Face",
      description: "Open-source models with free inference",
      defaultModel: "microsoft/DialoGPT-medium",
      models: [
        "microsoft/DialoGPT-medium",
        "microsoft/DialoGPT-large",
        "facebook/blenderbot-400M-distill",
      ],
      endpoint: "https://api-inference.huggingface.co/models",
      signupUrl: "https://huggingface.co/settings/tokens",
      freeLimit: "Rate limited, generous",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      color: "text-yellow-600",
    },
    mock: {
      name: "Mock Provider",
      description: "Pre-built templates, no API required",
      defaultModel: "mock-model",
      models: ["mock-model"],
      endpoint: null,
      signupUrl: null,
      freeLimit: "Unlimited",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      color: "text-gray-600",
    },
  };

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem("ai-provider-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error("Failed to parse saved config:", error);
      }
    }
  }, []);

  const handleProviderChange = (newProvider) => {
    const newConfig = {
      ...config,
      provider: newProvider,
      model: providers[newProvider].defaultModel,
      endpoint: providers[newProvider].endpoint || "",
    };
    setConfig(newConfig);
    updateEnvironment(newConfig);
  };

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    updateEnvironment(newConfig);
  };

  const updateEnvironment = (newConfig) => {
    // Save to localStorage
    localStorage.setItem("ai-provider-config", JSON.stringify(newConfig));

    // Update environment variables (for runtime)
    if (typeof window !== "undefined") {
      window.VITE_LLM_PROVIDER = newConfig.provider;
      window.VITE_LLM_API_KEY = newConfig.apiKey;
      window.VITE_LLM_MODEL = newConfig.model;
      window.VITE_LLM_ENDPOINT = newConfig.endpoint;
    }

    // Notify parent component
    if (onProviderChange) {
      onProviderChange(newConfig);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      if (config.provider === "mock") {
        setTestResult({
          success: true,
          message: "Mock provider is always available",
        });
        return;
      }

      if (!config.apiKey) {
        setTestResult({ success: false, message: "API key is required" });
        return;
      }

      // Simple test request
      const testPrompt = "Generate a simple contact form";
      const response = await fetch("/api/test-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          prompt: testPrompt,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful!" });
      } else {
        const error = await response.text();
        setTestResult({ success: false, message: `Test failed: ${error}` });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyEnvConfig = () => {
    const envText = `# AI Provider Configuration
VITE_LLM_PROVIDER=${config.provider}
${config.apiKey ? `VITE_LLM_API_KEY=${config.apiKey}` : "# VITE_LLM_API_KEY=your_api_key_here"}
VITE_LLM_MODEL=${config.model}
${config.endpoint ? `VITE_LLM_ENDPOINT=${config.endpoint}` : ""}`;

    navigator.clipboard.writeText(envText).then(() => {
      alert("Environment configuration copied to clipboard!");
    });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Provider Configuration</h2>
          <p className="text-gray-600">
            Choose a free AI provider for form generation
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowConfig(!showConfig)}>
          {showConfig ? "Hide" : "Show"} Config
        </Button>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(providers).map(([key, provider]) => (
          <Card
            key={key}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              config.provider === key
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleProviderChange(key)}
          >
            <div className="text-center">
              <div className={`text-3xl mb-2 ${provider.color}`}>
                {provider.icon}
              </div>
              <h3 className="font-semibold mb-1">{provider.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {provider.description}
              </p>
              <div className="text-xs text-gray-500">
                <div>Free: {provider.freeLimit}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Current Provider Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{providers[config.provider].icon}</span>
          <h3 className="text-lg font-semibold">
            {providers[config.provider].name}
          </h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Active
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {providers[config.provider].description}
        </p>
        {providers[config.provider].signupUrl && (
          <a
            href={providers[config.provider].signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Get API Key →
          </a>
        )}
      </div>

      {showConfig && (
        <div className="space-y-4 border-t pt-4">
          {/* API Key Input */}
          {config.provider !== "mock" && (
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={config.apiKey}
                onChange={(e) => handleConfigChange("apiKey", e.target.value)}
              />
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={config.model}
              onChange={(e) => handleConfigChange("model", e.target.value)}
            >
              {providers[config.provider].models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Endpoint */}
          {config.provider !== "mock" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Endpoint (Optional)
              </label>
              <Input
                type="url"
                placeholder={providers[config.provider].endpoint}
                value={config.endpoint}
                onChange={(e) => handleConfigChange("endpoint", e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Testing..." : "Test Connection"}
            </Button>
            <Button onClick={copyEnvConfig} variant="outline">
              Copy .env Config
            </Button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg ${
                testResult.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Environment Variables Preview */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Environment Variables</h4>
            <pre className="text-sm text-gray-700">
              {`VITE_LLM_PROVIDER=${config.provider}
${config.apiKey ? `VITE_LLM_API_KEY=${config.apiKey.substring(0, 10)}...` : "VITE_LLM_API_KEY=your_api_key_here"}
VITE_LLM_MODEL=${config.model}
${config.endpoint ? `VITE_LLM_ENDPOINT=${config.endpoint}` : ""}`}
            </pre>
          </div>
        </div>
      )}

      {/* Quick Setup Guide */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Quick Setup:</h4>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Choose your preferred provider above</li>
          <li>Get API key from the provider's website</li>
          <li>Enter the API key and test the connection</li>
          <li>Copy the .env configuration to your project</li>
        </ol>
        <p className="text-xs text-gray-600 mt-2">
          Don't have an API key? The Mock provider works without any setup!
        </p>
      </div>
    </Card>
  );
};

export default AIProviderConfig;
