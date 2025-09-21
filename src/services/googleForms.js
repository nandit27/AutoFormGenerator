import { GOOGLE_FORMS_MAPPINGS, FORM_STATUS } from "../types";
import { convertToGoogleFormsFormat } from "../utils";

class GoogleFormsService {
  constructor() {
    this.baseUrl = "https://forms.googleapis.com/v1";
    this.scopes = [
      "https://www.googleapis.com/auth/forms.body",
      "https://www.googleapis.com/auth/forms.responses.readonly",
    ];
    this.clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    this.clientSecret = import.meta.env?.VITE_GOOGLE_CLIENT_SECRET;
    this.redirectUri =
      import.meta.env?.VITE_GOOGLE_REDIRECT_URI || window.location.origin;
    this.accessToken = null;
    this.authClient = null;
  }

  /**
   * Initialize Google Auth
   */
  async initializeAuth() {
    try {
      // Validate required configuration
      if (!this.clientId) {
        throw new Error(
          "Google Client ID is required. Please set VITE_GOOGLE_CLIENT_ID in your .env file",
        );
      }

      // Load Google Auth library
      await this.loadGoogleAuth();

      // Wait for Google library to be fully loaded
      await this.waitForGoogleLibrary();

      // Initialize the auth client with proper error handling
      this.authClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes.join(" "),
        callback: this.handleAuthResponse.bind(this),
        error_callback: this.handleAuthError.bind(this),
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize Google Auth:", error);
      throw new Error(
        `Google authentication initialization failed: ${error.message}`,
      );
    }
  }

  /**
   * Load Google Auth library
   * @private
   */
  async loadGoogleAuth() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add small delay to ensure library is fully initialized
        setTimeout(() => resolve(), 100);
      };
      script.onerror = () =>
        reject(new Error("Failed to load Google Auth library"));
      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Google library to be fully loaded
   * @private
   */
  async waitForGoogleLibrary() {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      if (window.google?.accounts?.oauth2?.initTokenClient) {
        return;
      }
      await this.delay(100);
      attempts++;
    }

    throw new Error("Google library failed to load completely");
  }

  /**
   * Handle authentication response
   * @private
   */
  handleAuthResponse(response) {
    if (response.access_token) {
      this.accessToken = response.access_token;
      this.tokenExpiry = Date.now() + response.expires_in * 1000;
      console.log("Google authentication successful");
    } else {
      console.error("Authentication response:", response);
      throw new Error("Authentication failed - no access token received");
    }
  }

  /**
   * Handle authentication errors
   * @private
   */
  handleAuthError(error) {
    console.error("Google Auth Error:", error);

    // Handle specific error types
    if (error.type === "popup_blocked") {
      throw new Error(
        "Popup was blocked. Please allow popups for this site and try again.",
      );
    } else if (error.type === "popup_closed") {
      throw new Error("Authentication was cancelled. Please try again.");
    } else if (error.type === "invalid_client") {
      throw new Error(
        "Invalid client configuration. Please check your Google Client ID.",
      );
    } else {
      throw new Error(
        `Authentication error: ${error.type || error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Request user authentication
   * @returns {Promise<boolean>} Success status
   */
  async authenticate() {
    try {
      if (!this.authClient) {
        await this.initializeAuth();
      }

      return new Promise((resolve, reject) => {
        const originalCallback = this.authClient.callback;

        this.authClient.callback = (response) => {
          try {
            this.handleAuthResponse(response);
            resolve(true);
          } catch (error) {
            reject(error);
          } finally {
            // Restore original callback
            this.authClient.callback = originalCallback;
          }
        };

        const originalErrorCallback = this.authClient.error_callback;

        this.authClient.error_callback = (error) => {
          try {
            this.handleAuthError(error);
          } catch (authError) {
            reject(authError);
          } finally {
            // Restore original error callback
            this.authClient.error_callback = originalErrorCallback;
          }
        };

        // Request access token with prompt to ensure fresh consent
        this.authClient.requestAccessToken({
          prompt: "consent",
        });
      });
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error(`Failed to authenticate with Google: ${error.message}`);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!(
      this.accessToken &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry
    );
  }

  /**
   * Clear authentication state
   */
  clearAuth() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get authorization headers
   * @private
   */
  getAuthHeaders() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Google");
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Create a new Google Form from schema
   * @param {Object} schema - Form schema
   * @returns {Promise<Object>} Created form details
   */
  async createForm(schema) {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      // Step 1: Create the form with only title
      const form = await this.createEmptyForm(schema.title);

      // Step 2: Add description and fields to the form
      const requests = convertToGoogleFormsFormat(schema, false); // Don't include title

      if (requests.length > 0) {
        await this.batchUpdateForm(form.formId, requests);
      }

      // Step 3: Get the updated form with responder URI
      const updatedForm = await this.getForm(form.formId);

      return {
        formId: form.formId,
        responderUri: updatedForm.responderUri,
        editUrl: `https://docs.google.com/forms/d/${form.formId}/edit`,
        status: FORM_STATUS.PUBLISHED,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error creating Google Form:", error);
      console.error("Schema that failed:", schema);
      throw new Error(`Failed to create Google Form: ${error.message}`);
    }
  }

  /**
   * Create an empty Google Form
   * @private
   */
  async createEmptyForm(title) {
    const response = await fetch(`${this.baseUrl}/forms`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        info: {
          title: title || "Untitled Form",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;
      } catch (e) {
        errorMessage = errorText;
      }
      throw new Error(`Failed to create form: ${errorMessage}`);
    }

    return await response.json();
  }

  /**
   * Batch update form with fields
   * @private
   */
  async batchUpdateForm(formId, requests) {
    // Google Forms API has a limit of 100 operations per batch
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await this.executeBatch(formId, batch);

      // Add delay between batches to avoid rate limiting
      if (batches.length > 1) {
        await this.delay(1000);
      }
    }
  }

  /**
   * Execute a batch of requests
   * @private
   */
  async executeBatch(formId, requests) {
    console.log(
      `Executing batch update for form ${formId} with ${requests.length} requests`,
    );

    // Validate requests before sending
    const validationErrors = this.validateBatchRequests(requests);
    if (validationErrors.length > 0) {
      console.error("Batch validation errors:", validationErrors);
      throw new Error(`Invalid batch requests: ${validationErrors.join(", ")}`);
    }

    console.log("Batch requests:", JSON.stringify(requests, null, 2));

    const response = await fetch(
      `${this.baseUrl}/forms/${formId}:batchUpdate`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          requests: requests,
          includeFormInResponse: false,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Batch update failed with status:", response.status);
      console.error("Error response:", errorText);
      console.error("Failed requests:", JSON.stringify(requests, null, 2));

      let errorMessage;
      let detailedError = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;

        // Extract more detailed error information
        if (errorJson.error?.details) {
          const details = errorJson.error.details
            .map((detail) => {
              if (detail.fieldViolations) {
                return detail.fieldViolations
                  .map(
                    (violation) =>
                      `Field '${violation.field}': ${violation.description}`,
                  )
                  .join("; ");
              }
              return detail.reason || JSON.stringify(detail);
            })
            .join("; ");
          detailedError = `${errorMessage}. Details: ${details}`;
        }
      } catch (e) {
        errorMessage = errorText;
      }

      throw new Error(`Batch update failed: ${detailedError}`);
    }

    const result = await response.json();
    console.log("Batch update successful");
    return result;
  }

  /**
   * Validate batch requests before sending to Google Forms API
   * @private
   */
  validateBatchRequests(requests) {
    const errors = [];

    requests.forEach((request, index) => {
      if (request.createItem) {
        const item = request.createItem.item;

        // Validate item structure
        if (!item.title || item.title.trim() === "") {
          errors.push(`Request ${index}: Item title is required`);
        }

        if (!item.questionItem || !item.questionItem.question) {
          errors.push(`Request ${index}: Question structure is required`);
        } else {
          const question = item.questionItem.question;

          // Validate question has at least one question type
          const questionTypes = [
            "textQuestion",
            "choiceQuestion",
            "dateQuestion",
            "timeQuestion",
            "fileUploadQuestion",
          ];
          const hasQuestionType = questionTypes.some((type) => question[type]);

          if (!hasQuestionType) {
            errors.push(
              `Request ${index}: Question must have a valid question type`,
            );
          }

          // Validate choice questions
          if (question.choiceQuestion) {
            const validChoiceTypes = ["RADIO", "CHECKBOX", "DROP_DOWN"];
            if (!validChoiceTypes.includes(question.choiceQuestion.type)) {
              errors.push(
                `Request ${index}: Invalid choice question type '${question.choiceQuestion.type}'. Valid types: ${validChoiceTypes.join(", ")}`,
              );
            }

            if (
              !question.choiceQuestion.options ||
              question.choiceQuestion.options.length === 0
            ) {
              errors.push(
                `Request ${index}: Choice question must have options`,
              );
            }
          }
        }

        // Validate location
        if (
          !request.createItem.location ||
          typeof request.createItem.location.index !== "number"
        ) {
          errors.push(
            `Request ${index}: Valid location with index is required`,
          );
        }
      }

      if (request.updateFormInfo) {
        const info = request.updateFormInfo.info;
        const updateMask = request.updateFormInfo.updateMask;

        if (!updateMask || updateMask.trim() === "") {
          errors.push(
            `Request ${index}: updateMask is required for updateFormInfo`,
          );
        }

        if (!info || Object.keys(info).length === 0) {
          errors.push(
            `Request ${index}: info object is required for updateFormInfo`,
          );
        }
      }
    });

    return errors;
  }

  /**
   * Get form details
   * @param {string} formId - Google Form ID
   * @returns {Promise<Object>} Form details
   */
  async getForm(formId) {
    const response = await fetch(`${this.baseUrl}/forms/${formId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to get form: ${error.error?.message || response.statusText}`,
      );
    }

    return await response.json();
  }

  /**
   * Get form responses
   * @param {string} formId - Google Form ID
   * @returns {Promise<Array>} Form responses
   */
  async getResponses(formId) {
    const response = await fetch(`${this.baseUrl}/forms/${formId}/responses`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to get responses: ${error.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return this.formatResponses(data.responses || []);
  }

  /**
   * Format Google Forms responses to our format
   * @private
   */
  formatResponses(responses) {
    return responses.map((response) => ({
      id: response.responseId,
      submittedAt: response.lastSubmittedTime,
      answers: this.formatAnswers(response.answers || {}),
      metadata: {
        createTime: response.createTime,
        lastSubmittedTime: response.lastSubmittedTime,
      },
    }));
  }

  /**
   * Format answers from Google Forms format
   * @private
   */
  formatAnswers(answers) {
    const formattedAnswers = {};

    Object.entries(answers).forEach(([questionId, answer]) => {
      if (answer.textAnswers) {
        formattedAnswers[questionId] = answer.textAnswers.answers
          .map((a) => a.value)
          .join(", ");
      } else if (answer.fileUploadAnswers) {
        formattedAnswers[questionId] = answer.fileUploadAnswers.answers.map(
          (a) => a.fileName,
        );
      } else if (answer.grade) {
        formattedAnswers[questionId] = answer.grade.score;
      }
    });

    return formattedAnswers;
  }

  /**
   * Update form settings
   * @param {string} formId - Google Form ID
   * @param {Object} settings - New settings
   * @returns {Promise<Object>} Updated form
   */
  async updateFormSettings(formId, settings) {
    const requests = [];

    if (settings.title || settings.description) {
      requests.push({
        updateFormInfo: {
          info: {
            title: settings.title,
            description: settings.description,
          },
          updateMask: Object.keys(settings).join(","),
        },
      });
    }

    if (settings.collectEmail !== undefined) {
      requests.push({
        updateSettings: {
          settings: {
            quizSettings: {
              isQuiz: false,
            },
          },
          updateMask: "quizSettings",
        },
      });
    }

    if (requests.length > 0) {
      await this.batchUpdateForm(formId, requests);
    }

    return await this.getForm(formId);
  }

  /**
   * Delete a Google Form
   * @param {string} formId - Google Form ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteForm(formId) {
    // Note: Google Forms API doesn't support deletion
    // Forms can only be moved to trash via Drive API
    console.warn("Google Forms API does not support form deletion");
    return false;
  }

  /**
   * Check Google Forms API rate limits
   * @private
   */
  async checkRateLimit() {
    // Implement exponential backoff for rate limiting
    if (this.rateLimitDelay) {
      await this.delay(this.rateLimitDelay);
      this.rateLimitDelay = Math.min(this.rateLimitDelay * 2, 60000); // Max 1 minute
    }
  }

  /**
   * Handle rate limit errors
   * @private
   */
  handleRateLimit(error) {
    if (error.status === 429 || error.code === "RATE_LIMIT_EXCEEDED") {
      this.rateLimitDelay = this.rateLimitDelay
        ? this.rateLimitDelay * 2
        : 1000;
      throw new Error("Rate limit exceeded. Please try again later.");
    }
  }

  /**
   * Delay execution
   * @private
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate form schema before creating
   * @param {Object} schema - Form schema to validate
   * @returns {Array} Validation errors
   */
  validateSchema(schema) {
    const errors = [];

    if (!schema.title) {
      errors.push("Form title is required");
    }

    if (
      !schema.fields ||
      !Array.isArray(schema.fields) ||
      schema.fields.length === 0
    ) {
      errors.push("At least one form field is required");
    }

    // Check for unsupported field types
    schema.fields?.forEach((field, index) => {
      if (!GOOGLE_FORMS_MAPPINGS[field.type]) {
        errors.push(
          `Field ${index + 1}: "${field.type}" is not supported in Google Forms`,
        );
      }
    });

    // Check for too many fields (Google Forms has limits)
    if (schema.fields && schema.fields.length > 1000) {
      errors.push("Google Forms supports maximum 1000 questions per form");
    }

    return errors;
  }

  /**
   * Get supported field types for Google Forms
   * @returns {Array} Supported field types
   */
  getSupportedFieldTypes() {
    return Object.keys(GOOGLE_FORMS_MAPPINGS);
  }

  /**
   * Convert form schema to Google Forms compatible format
   * @param {Object} schema - Original schema
   * @returns {Object} Google Forms compatible schema
   */
  adaptSchemaForGoogleForms(schema) {
    const adaptedSchema = { ...schema };

    // Convert unsupported fields to text fields with instructions
    adaptedSchema.fields = schema.fields.map((field) => {
      if (!GOOGLE_FORMS_MAPPINGS[field.type]) {
        return {
          ...field,
          type: "text",
          label: `${field.label} (${field.type})`,
          description:
            field.description ||
            `Please provide your ${field.type} information`,
        };
      }
      return field;
    });

    // Payment fields are not supported in Google Forms
    // All schemas should now be payment-free

    return adaptedSchema;
  }

  /**
   * Get form analytics (if available)
   * @param {string} formId - Google Form ID
   * @returns {Promise<Object>} Form analytics
   */
  async getFormAnalytics(formId) {
    try {
      const responses = await this.getResponses(formId);
      const form = await this.getForm(formId);

      return {
        totalResponses: responses.length,
        responseRate: 0, // Google Forms doesn't provide view count
        avgCompletionTime: 0, // Not available in Google Forms API
        lastResponse:
          responses.length > 0
            ? responses[responses.length - 1].submittedAt
            : null,
        formCreated: form.info?.created || null,
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        totalResponses: 0,
        responseRate: 0,
        avgCompletionTime: 0,
        lastResponse: null,
        formCreated: null,
      };
    }
  }
}

// Export singleton instance
export default new GoogleFormsService();
