// Runtime environment variable management and provider configuration
class ProviderConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.listeners = [];
  }

  loadConfig() {
    // Try to load from localStorage first
    const savedConfig = localStorage.getItem('ai-provider-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Override environment variables with saved config
        this.updateEnvironmentVariables(parsed);
        return parsed;
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }

    // Fallback to environment variables
    return {
      provider: import.meta.env?.VITE_LLM_PROVIDER || 'mock',
      apiKey: import.meta.env?.VITE_LLM_API_KEY || '',
      model: import.meta.env?.VITE_LLM_MODEL || this.getDefaultModel(),
      endpoint: import.meta.env?.VITE_LLM_ENDPOINT || ''
    };
  }

  getDefaultModel(provider = null) {
    const currentProvider = provider || this.config?.provider || 'mock';
    const defaults = {
      groq: 'llama3-8b-8192',
      huggingface: 'microsoft/DialoGPT-medium',
      gemini: 'gemini-pro',
      mock: 'mock-model'
    };
    return defaults[currentProvider] || 'mock-model';
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Save to localStorage
    localStorage.setItem('ai-provider-config', JSON.stringify(this.config));

    // Update environment variables
    this.updateEnvironmentVariables(this.config);

    // Notify listeners
    this.notifyListeners(this.config);

    return this.config;
  }

  updateEnvironmentVariables(config) {
    // Update runtime environment variables
    if (typeof window !== 'undefined') {
      // Create a meta object if it doesn't exist
      if (!import.meta.env) {
        import.meta.env = {};
      }

      import.meta.env.VITE_LLM_PROVIDER = config.provider;
      import.meta.env.VITE_LLM_API_KEY = config.apiKey;
      import.meta.env.VITE_LLM_MODEL = config.model;
      import.meta.env.VITE_LLM_ENDPOINT = config.endpoint;

      // Also set on window for global access
      window.VITE_LLM_PROVIDER = config.provider;
      window.VITE_LLM_API_KEY = config.apiKey;
      window.VITE_LLM_MODEL = config.model;
      window.VITE_LLM_ENDPOINT = config.endpoint;
    }
  }

  getConfig() {
    return { ...this.config };
  }

  getProvider() {
    return this.config.provider;
  }

  getApiKey() {
    return this.config.apiKey;
  }

  getModel() {
    return this.config.model;
  }

  getEndpoint() {
    return this.config.endpoint;
  }

  isConfigured() {
    if (this.config.provider === 'mock') {
      return true;
    }
    return !!(this.config.apiKey && this.config.model);
  }

  // Provider-specific configuration helpers
  getProviderInfo() {
    const providers = {
      groq: {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
        requiresApiKey: true,
        freeLimit: '6,000 requests/minute'
      },
      gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        models: ['gemini-pro', 'gemini-pro-vision'],
        requiresApiKey: true,
        freeLimit: '15 requests/minute'
      },
      huggingface: {
        name: 'Hugging Face',
        endpoint: 'https://api-inference.huggingface.co/models',
        models: ['microsoft/DialoGPT-medium', 'microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill'],
        requiresApiKey: true,
        freeLimit: 'Rate limited'
      },
      mock: {
        name: 'Mock Provider',
        endpoint: null,
        models: ['mock-model'],
        requiresApiKey: false,
        freeLimit: 'Unlimited'
      }
    };

    return providers[this.config.provider] || providers.mock;
  }

  // Event system for configuration changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(config) {
    this.listeners.forEach(callback => {
      try {
        callback(config);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }

  // Provider validation
  async validateProvider(config = null) {
    const testConfig = config || this.config;

    if (testConfig.provider === 'mock') {
      return { valid: true, message: 'Mock provider is always valid' };
    }

    if (!testConfig.apiKey) {
      return { valid: false, message: 'API key is required' };
    }

    if (!testConfig.model) {
      return { valid: false, message: 'Model selection is required' };
    }

    // Here you could add actual API validation calls
    return { valid: true, message: 'Configuration appears valid' };
  }

  // Generate environment file content
  generateEnvFile() {
    const lines = [
      '# AI Provider Configuration',
      '# Generated by AutoFormGenerator',
      '',
      `VITE_LLM_PROVIDER=${this.config.provider}`,
    ];

    if (this.config.apiKey) {
      lines.push(`VITE_LLM_API_KEY=${this.config.apiKey}`);
    } else {
      lines.push('# VITE_LLM_API_KEY=your_api_key_here');
    }

    lines.push(`VITE_LLM_MODEL=${this.config.model}`);

    if (this.config.endpoint) {
      lines.push(`VITE_LLM_ENDPOINT=${this.config.endpoint}`);
    }

    return lines.join('\n');
  }

  // Reset to defaults
  reset() {
    localStorage.removeItem('ai-provider-config');
    this.config = {
      provider: 'mock',
      apiKey: '',
      model: 'mock-model',
      endpoint: ''
    };
    this.updateEnvironmentVariables(this.config);
    this.notifyListeners(this.config);
  }

  // Quick provider switch methods
  switchToGroq(apiKey) {
    return this.updateConfig({
      provider: 'groq',
      apiKey,
      model: 'llama3-8b-8192',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    });
  }

  switchToGemini(apiKey) {
    return this.updateConfig({
      provider: 'gemini',
      apiKey,
      model: 'gemini-pro',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    });
  }

  switchToHuggingFace(apiKey) {
    return this.updateConfig({
      provider: 'huggingface',
      apiKey,
      model: 'microsoft/DialoGPT-medium',
      endpoint: 'https://api-inference.huggingface.co/models'
    });
  }

  switchToMock() {
    return this.updateConfig({
      provider: 'mock',
      apiKey: '',
      model: 'mock-model',
      endpoint: ''
    });
  }
}

// Create a singleton instance
const providerConfig = new ProviderConfigManager();

// Export both the instance and the class
export default providerConfig;
export { ProviderConfigManager };

// Helper functions for backward compatibility
export const getCurrentProvider = () => providerConfig.getProvider();
export const getCurrentConfig = () => providerConfig.getConfig();
export const updateProviderConfig = (config) => providerConfig.updateConfig(config);
export const isProviderConfigured = () => providerConfig.isConfigured();
