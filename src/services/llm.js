import {
  DEFAULT_FORM_SCHEMA,
  FIELD_TYPES,
  GOOGLE_FORMS_MAPPINGS,
} from "../types";
import { toSnakeCase } from "../utils";
import providerConfig from "../utils/providerConfig";

// LLM service supporting multiple free AI providers - Google Forms only
class LLMService {
  constructor() {
    this.config = providerConfig;
    this.refreshConfig();

    // Listen for configuration changes
    this.config.addListener(() => {
      this.refreshConfig();
    });
  }

  refreshConfig() {
    const config = this.config.getConfig();
    this.provider = config.provider;
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.apiEndpoint = config.endpoint || this.getApiEndpoint();
  }

  getDefaultModel() {
    return this.config.getDefaultModel(this.provider);
  }

  getApiEndpoint() {
    const providerInfo = this.config.getProviderInfo();
    return providerInfo.endpoint;
  }

  /**
   * Generate form schema from natural language prompt - LLM only
   * @param {string} prompt - User's natural language prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated form schema
   */
  async generateFormSchema(prompt, options = {}) {
    try {
      // Validate configuration
      if (!this.config.isConfigured() || this.provider === "mock") {
        throw new Error(
          "LLM provider must be configured. Please configure an AI provider in settings to generate forms.",
        );
      }

      if (!this.apiEndpoint || !this.apiKey) {
        throw new Error(
          "API configuration incomplete. Please check your provider settings.",
        );
      }

      const response = await this.callLLMAPI(prompt, options);
      return this.validateAndCleanSchema(response);
    } catch (error) {
      console.error(`LLM service error (${this.provider}):`, error);
      throw new Error(
        `Failed to generate form schema: ${error.message}. Please check your AI provider configuration.`,
      );
    }
  }

  /**
   * Call the actual LLM API
   * @private
   */
  async callLLMAPI(prompt, options) {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.formatUserPrompt(prompt, options);

    switch (this.provider) {
      case "groq":
        return this.callGroqAPI(systemPrompt, userPrompt);
      case "huggingface":
        return this.callHuggingFaceAPI(systemPrompt, userPrompt);
      case "gemini":
        return this.callGeminiAPI(systemPrompt, userPrompt);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async callGroqAPI(systemPrompt, userPrompt) {
    const requestBody = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    };

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async callHuggingFaceAPI(systemPrompt, userPrompt) {
    const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant: `;

    const response = await fetch(`${this.apiEndpoint}/${this.model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 3000,
          temperature: 0.1,
          return_full_text: false,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HuggingFace API error: ${response.status} - ${errorData.error || response.statusText}`,
      );
    }

    const data = await response.json();
    const generatedText = Array.isArray(data)
      ? data[0].generated_text
      : data.generated_text;

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    return JSON.parse(jsonMatch[0]);
  }

  async callGeminiAPI(systemPrompt, userPrompt) {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nPlease respond with valid JSON only, no additional text or markdown.`;

    const response = await fetch(
      `${this.apiEndpoint}/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 3000,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in Gemini response");
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Get enhanced system prompt optimized for Google Forms API compliance
   * @private
   */
  getSystemPrompt() {
    return `You are an expert Google Forms schema generator. Create form schemas that perfectly comply with Google Forms API structure and limitations.

CRITICAL: Respond ONLY with valid JSON. No explanations, markdown, or additional text.

Google Forms API Compliance Rules:
1. Field types must map to Google Forms supported types:
   - text/email/phone/url → SHORT_ANSWER (with validation)
   - textarea → PARAGRAPH
   - number → SHORT_ANSWER (with number validation)
   - select → DROP_DOWN
   - radio → MULTIPLE_CHOICE
   - checkbox → CHECKBOX
   - date → DATE
   - time → TIME
   - file → FILE_UPLOAD

2. Google Forms limitations:
   - NO payment fields (payment not supported in Google Forms)
   - NO datetime-local fields (use separate date/time)
   - File uploads have size/type restrictions
   - Maximum 300 fields per form
   - Questions must have clear, concise titles

3. Validation rules for Google Forms:
   - Email: built-in email validation
   - Phone: regex pattern validation
   - Number: number validation with min/max
   - Text: length validation with min/max characters
   - URL: built-in URL validation

Required JSON Schema:
{
  "title": "string (required, max 300 chars)",
  "description": "string (required, max 4096 chars)",
  "language": "en|hi|gu|mr|ta|te|kn|ml|bn|pa",
  "fields": [
    {
      "id": "string (snake_case, unique)",
      "label": "string (required, max 300 chars)",
      "type": "text|email|phone|number|select|checkbox|radio|date|textarea|url|time|file",
      "required": true|false,
      "placeholder": "string|null (help text, max 300 chars)",
      "options": ["string"] | null (for select/radio/checkbox only),
      "description": "string|null (help text, max 300 chars)",
      "validation": {
        "pattern": "regex_string|null",
        "min": number|null (min value for numbers, min length for text),
        "max": number|null (max value for numbers, max length for text),
        "message": "string|null (custom error message)"
      } | null
    }
  ],
  "settings": {
    "collect_email": true|false,
    "allow_multiple_submissions": true|false,
    "confirmation_message": "string|null (max 1024 chars)",
    "payment": {
      "enabled": false (ALWAYS false for Google Forms)
    },
    "show_progress_bar": true|false,
    "redirect_url": "string|null (valid URL)",
    "notifications": {
      "enabled": true|false,
      "email": "string|null (valid email)",
      "subject": "string|null (max 200 chars)"
    }
  }
}

Best Practices:
- Use clear, specific field labels
- Add helpful descriptions for complex fields
- Set appropriate validation for data integrity
- Group related fields logically
- Use proper field types for data collection
- Include required fields based on form purpose
- Limit options lists to reasonable lengths (max 100 items)
- Use snake_case for field IDs
- Ensure field IDs are unique and descriptive

Field Type Guidelines:
- Contact info: Use email, phone with validation
- Dates: Use date type, not datetime-local
- Large text: Use textarea for comments/descriptions
- Choices: Use radio for single choice, checkbox for multiple
- Dropdowns: Use select for long option lists
- Files: Specify accepted file types in description
- Numbers: Set appropriate min/max ranges

NEVER include payment fields or payment-related functionality as Google Forms doesn't support payments.`;
  }

  /**
   * Format user prompt with context and Google Forms constraints
   * @private
   */
  formatUserPrompt(prompt, options) {
    let formattedPrompt = `Create a Google Forms compatible schema for: "${prompt}"

Requirements:
- Must be compatible with Google Forms API
- No payment fields (Google Forms doesn't support payments)
- Use appropriate Google Forms field types
- Include proper validation rules
- Set meaningful field labels and descriptions`;

    if (options.language && options.language !== "en") {
      formattedPrompt += `\n- Generate form in language: ${options.language}`;
    }

    if (options.context) {
      formattedPrompt += `\n- Additional context: ${options.context}`;
    }

    if (options.preferences) {
      if (options.preferences.collect_email !== undefined) {
        formattedPrompt += `\n- Collect respondent email: ${options.preferences.collect_email}`;
      }
      if (options.preferences.required_fields) {
        formattedPrompt += `\n- Required fields: ${options.preferences.required_fields.join(", ")}`;
      }
      if (options.preferences.max_fields) {
        formattedPrompt += `\n- Maximum ${options.preferences.max_fields} fields`;
      }
    }

    formattedPrompt += `\n\nRespond with valid JSON only, following the exact schema format specified.`;

    return formattedPrompt;
  }

  /**
   * Validate and clean generated schema for Google Forms compatibility
   * @private
   */
  validateAndCleanSchema(schema) {
    if (!schema || typeof schema !== "object") {
      throw new Error("Invalid schema format received from LLM");
    }

    // Ensure all required fields are present
    const cleanSchema = {
      ...DEFAULT_FORM_SCHEMA,
      ...schema,
    };

    // Validate title and description
    if (!cleanSchema.title || cleanSchema.title.trim().length === 0) {
      throw new Error("Form title is required");
    }

    if (cleanSchema.title.length > 300) {
      cleanSchema.title = cleanSchema.title.substring(0, 300);
    }

    if (cleanSchema.description && cleanSchema.description.length > 4096) {
      cleanSchema.description = cleanSchema.description.substring(0, 4096);
    }

    // Validate and clean fields
    if (!cleanSchema.fields || !Array.isArray(cleanSchema.fields)) {
      throw new Error("Form must have at least one field");
    }

    if (cleanSchema.fields.length === 0) {
      throw new Error("Form must have at least one field");
    }

    if (cleanSchema.fields.length > 300) {
      cleanSchema.fields = cleanSchema.fields.slice(0, 300);
    }

    // Clean and validate each field
    const fieldIds = new Set();
    cleanSchema.fields = cleanSchema.fields.map((field, index) => {
      const cleanField = this.validateField(field, index);

      // Ensure unique field IDs
      let uniqueId = cleanField.id;
      let counter = 1;
      while (fieldIds.has(uniqueId)) {
        uniqueId = `${cleanField.id}_${counter}`;
        counter++;
      }
      fieldIds.add(uniqueId);
      cleanField.id = uniqueId;

      return cleanField;
    });

    // Ensure payment is disabled (Google Forms doesn't support payments)
    cleanSchema.settings = {
      ...cleanSchema.settings,
      payment: {
        enabled: false,
        provider: null,
        amount_field_id: null,
        fixed_amount: null,
        currency: null,
        description: null,
      },
    };

    // Validate settings
    if (
      cleanSchema.settings.confirmation_message &&
      cleanSchema.settings.confirmation_message.length > 1024
    ) {
      cleanSchema.settings.confirmation_message =
        cleanSchema.settings.confirmation_message.substring(0, 1024);
    }

    if (
      cleanSchema.settings.notifications?.subject &&
      cleanSchema.settings.notifications.subject.length > 200
    ) {
      cleanSchema.settings.notifications.subject =
        cleanSchema.settings.notifications.subject.substring(0, 200);
    }

    return cleanSchema;
  }

  /**
   * Validate individual field for Google Forms compatibility
   * @private
   */
  validateField(field, index) {
    const cleanField = {
      id: field.id || toSnakeCase(field.label || `field_${index}`),
      label: field.label || "Untitled Field",
      type: this.validateFieldType(field.type),
      required: Boolean(field.required),
      placeholder: field.placeholder || null,
      options: this.validateFieldOptions(field),
      description: field.description || null,
      validation: this.validateFieldValidation(field),
    };

    // Validate label length
    if (cleanField.label.length > 300) {
      cleanField.label = cleanField.label.substring(0, 300);
    }

    // Validate placeholder length
    if (cleanField.placeholder && cleanField.placeholder.length > 300) {
      cleanField.placeholder = cleanField.placeholder.substring(0, 300);
    }

    // Validate description length
    if (cleanField.description && cleanField.description.length > 300) {
      cleanField.description = cleanField.description.substring(0, 300);
    }

    // Payment fields are not supported - they were removed from FIELD_TYPES
    // All field types should now be Google Forms compatible

    // Convert datetime-local to separate date and time fields
    if (cleanField.type === FIELD_TYPES.DATETIME) {
      cleanField.type = FIELD_TYPES.DATE;
      cleanField.description =
        (cleanField.description || "") +
        " (Use separate time field if time is needed)";
    }

    return cleanField;
  }

  /**
   * Validate field type for Google Forms compatibility
   * @private
   */
  validateFieldType(type) {
    // Check if type is supported
    if (!Object.values(FIELD_TYPES).includes(type)) {
      return FIELD_TYPES.TEXT; // Default fallback
    }

    // Check if type is supported by Google Forms
    if (!GOOGLE_FORMS_MAPPINGS[type]) {
      // Map unsupported types to supported ones
      switch (type) {
        default:
          return FIELD_TYPES.TEXT;
      }
    }

    return type;
  }

  /**
   * Validate field options for select/radio/checkbox fields
   * @private
   */
  validateFieldOptions(field) {
    const needsOptions = [
      FIELD_TYPES.SELECT,
      FIELD_TYPES.RADIO,
      FIELD_TYPES.CHECKBOX,
    ].includes(field.type);

    if (!needsOptions) {
      return null;
    }

    if (!Array.isArray(field.options) || field.options.length === 0) {
      // Provide default options for fields that require them
      return ["Option 1", "Option 2", "Option 3"];
    }

    // Limit options to reasonable number and length
    return field.options
      .slice(0, 100) // Max 100 options
      .map((option) =>
        typeof option === "string"
          ? option.substring(0, 200) // Max 200 chars per option
          : String(option).substring(0, 200),
      )
      .filter((option) => option.trim().length > 0);
  }

  /**
   * Validate field validation rules
   * @private
   */
  validateFieldValidation(field) {
    if (!field.validation || typeof field.validation !== "object") {
      // Add default validation for specific field types
      switch (field.type) {
        case FIELD_TYPES.EMAIL:
          return {
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message: "Please enter a valid email address",
          };
        case FIELD_TYPES.PHONE:
          return {
            pattern: "^[\\+]?[1-9][\\d]{0,15}$",
            message: "Please enter a valid phone number",
          };
        case FIELD_TYPES.URL:
          return {
            pattern: "^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$",
            message: "Please enter a valid URL",
          };
        default:
          return null;
      }
    }

    const validation = { ...field.validation };

    // Validate message length
    if (validation.message && validation.message.length > 300) {
      validation.message = validation.message.substring(0, 300);
    }

    // Ensure reasonable min/max values
    if (typeof validation.min === "number" && validation.min < 0) {
      validation.min = 0;
    }
    if (typeof validation.max === "number" && validation.max > 10000) {
      validation.max = 10000;
    }

    return validation;
  }

  /**
   * Additional utility method to check schema compatibility
   */
  isGoogleFormsCompatible(schema) {
    try {
      const validated = this.validateAndCleanSchema(schema);

      // All fields should be Google Forms compatible now
      // since PAYMENT field type has been removed

      // Check field count
      if (validated.fields.length > 300) {
        return {
          compatible: false,
          issues: ["Too many fields (max 300 for Google Forms)"],
        };
      }

      return {
        compatible: true,
        issues: [],
      };
    } catch (error) {
      return {
        compatible: false,
        issues: [error.message],
      };
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new LLMService();
