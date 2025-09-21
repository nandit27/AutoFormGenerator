// Form field types - Google Forms compatible only
export const FIELD_TYPES = {
  TEXT: "text",
  EMAIL: "email",
  PHONE: "phone",
  NUMBER: "number",
  SELECT: "select",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  DATE: "date",
  FILE: "file",
  TEXTAREA: "textarea",
  URL: "url",
  TIME: "time",
};

// Supported languages
export const LANGUAGES = {
  EN: "en",
  HI: "hi",
  GU: "gu",
  MR: "mr",
  TA: "ta",
  TE: "te",
  KN: "kn",
  ML: "ml",
  BN: "bn",
  PA: "pa",
};

// Payment providers - Not supported in Google Forms
// export const PAYMENT_PROVIDERS = {
//   RAZORPAY: "razorpay",
//   STRIPE: "stripe",
//   PAYPAL: "paypal",
// };

// Google Forms field type mappings
export const GOOGLE_FORMS_MAPPINGS = {
  [FIELD_TYPES.TEXT]: "SHORT_ANSWER",
  [FIELD_TYPES.TEXTAREA]: "PARAGRAPH",
  [FIELD_TYPES.EMAIL]: "SHORT_ANSWER",
  [FIELD_TYPES.PHONE]: "SHORT_ANSWER",
  [FIELD_TYPES.NUMBER]: "SHORT_ANSWER",
  [FIELD_TYPES.SELECT]: "DROP_DOWN",
  [FIELD_TYPES.CHECKBOX]: "CHECKBOX",
  [FIELD_TYPES.RADIO]: "MULTIPLE_CHOICE",
  [FIELD_TYPES.DATE]: "DATE",
  [FIELD_TYPES.TIME]: "TIME",
  [FIELD_TYPES.FILE]: "FILE_UPLOAD",
};

// Form creation flows - Google Forms only
export const FORM_FLOWS = {
  GOOGLE: "google",
};

// Form status
export const FORM_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  PROCESSING: "processing",
};

// API response status
export const API_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  URL: /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/,
  NUMBER: /^-?\d*\.?\d+$/,
};

/**
 * @typedef {Object} FormField
 * @property {string} id - Unique identifier in snake_case
 * @property {string} label - Human readable label
 * @property {string} type - Field type from FIELD_TYPES
 * @property {boolean} required - Whether field is required
 * @property {string|null} placeholder - Placeholder text
 * @property {string[]|null} options - Options for select/radio/checkbox
 * @property {Object|null} validation - Validation rules
 * @property {string|null} validation.pattern - Regex pattern
 * @property {number|null} validation.min - Minimum value/length
 * @property {number|null} validation.max - Maximum value/length
 * @property {string|null} validation.message - Custom validation message
 * @property {string|null} description - Field description/help text
 * @property {Object|null} conditional - Conditional display rules
 * @property {string|null} conditional.field - Field ID to depend on
 * @property {string|null} conditional.value - Value to match
 * @property {string} conditional.operator - Comparison operator (equals, contains, etc.)
 */

/**
 * @typedef {Object} PaymentSettings
 * @property {boolean} enabled - Whether payment is enabled
 * @property {string|null} provider - Payment provider (not supported in Google Forms)
 * @property {string|null} amount_field_id - Field ID containing amount
 * @property {number|null} fixed_amount - Fixed payment amount
 * @property {string|null} currency - Currency code (INR, USD, etc.)
 * @property {string|null} description - Payment description
 */

/**
 * @typedef {Object} FormSettings
 * @property {boolean} collect_email - Collect respondent email
 * @property {boolean} allow_multiple_submissions - Allow multiple submissions
 * @property {string|null} confirmation_message - Success message
 * @property {PaymentSettings} payment - Payment configuration
 * @property {boolean} show_progress_bar - Show progress indicator
 * @property {boolean} randomize_fields - Randomize field order
 * @property {string|null} redirect_url - Post-submission redirect
 * @property {Object|null} notifications - Email notification settings
 * @property {boolean} notifications.enabled - Enable notifications
 * @property {string|null} notifications.email - Notification email
 * @property {string|null} notifications.subject - Email subject
 */

/**
 * @typedef {Object} FormSchema
 * @property {string} title - Form title
 * @property {string} description - Form description
 * @property {string} language - Language code from LANGUAGES
 * @property {FormField[]} fields - Array of form fields
 * @property {FormSettings} settings - Form configuration
 * @property {Object|null} theme - Custom theme settings
 * @property {string|null} theme.primary_color - Primary color hex
 * @property {string|null} theme.background_color - Background color hex
 * @property {string|null} theme.font_family - Font family
 */

/**
 * @typedef {Object} GeneratedForm
 * @property {string} id - Unique form ID
 * @property {FormSchema} schema - Form schema
 * @property {string} flow - Creation flow (google/inapp)
 * @property {string} status - Form status
 * @property {string|null} google_form_id - Google Forms ID (if applicable)
 * @property {string|null} responder_uri - Public form URL
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {Object|null} analytics - Form analytics data
 * @property {number} analytics.views - Number of views
 * @property {number} analytics.submissions - Number of submissions
 * @property {number} analytics.conversion_rate - Conversion percentage
 */

/**
 * @typedef {Object} FormResponse
 * @property {string} id - Response ID
 * @property {string} form_id - Associated form ID
 * @property {Object} answers - Field answers (field_id -> value)
 * @property {string} submitted_at - Submission timestamp
 * @property {string|null} respondent_email - Respondent email if collected
 * @property {Object|null} metadata - Additional metadata
 * @property {string|null} metadata.ip_address - Respondent IP
 * @property {string|null} metadata.user_agent - User agent string
 * @property {string|null} metadata.referrer - Referrer URL
 * @property {Object|null} payment_info - Payment details if applicable
 * @property {string|null} payment_info.transaction_id - Payment transaction ID
 * @property {string|null} payment_info.status - Payment status
 * @property {number|null} payment_info.amount - Payment amount
 */

/**
 * @typedef {Object} LLMRequest
 * @property {string} prompt - User's natural language prompt
 * @property {string|null} context - Additional context
 * @property {string} language - Preferred language
 * @property {Object|null} preferences - User preferences
 */

/**
 * @typedef {Object} LLMResponse
 * @property {FormSchema} schema - Generated form schema
 * @property {number} confidence - Confidence score (0-1)
 * @property {string[]} suggestions - Improvement suggestions
 * @property {Object|null} metadata - Generation metadata
 */

/**
 * @typedef {Object} GoogleAuthConfig
 * @property {string} client_id - Google OAuth client ID
 * @property {string} client_secret - Google OAuth client secret
 * @property {string[]} scopes - Required OAuth scopes
 * @property {string} redirect_uri - OAuth redirect URI
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {Object|null} details - Additional error details
 * @property {number|null} status - HTTP status code
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request succeeded
 * @property {*} data - Response data
 * @property {ApiError|null} error - Error information
 * @property {Object|null} metadata - Response metadata
 * @property {string} metadata.request_id - Unique request ID
 * @property {number} metadata.timestamp - Response timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} theme - UI theme preference
 * @property {string} language - Preferred language
 * @property {boolean} animations_enabled - Enable animations
 * @property {boolean} notifications_enabled - Enable notifications
 * @property {Object} default_form_settings - Default form configuration
 */

/**
 * @typedef {Object} AppState
 * @property {string} status - Current app status
 * @property {GeneratedForm[]} forms - User's forms
 * @property {GeneratedForm|null} current_form - Currently selected form
 * @property {UserPreferences} user_preferences - User preferences
 * @property {Object} ui_state - UI state
 * @property {boolean} ui_state.sidebar_open - Sidebar visibility
 * @property {string|null} ui_state.active_modal - Active modal
 * @property {Object|null} ui_state.toast - Toast notification
 */

// Utility functions for type checking
export const isValidFieldType = (type) =>
  Object.values(FIELD_TYPES).includes(type);
export const isValidLanguage = (lang) =>
  Object.values(LANGUAGES).includes(lang);
// Payment providers not supported in Google Forms
// export const isValidPaymentProvider = (provider) =>
//   Object.values(PAYMENT_PROVIDERS).includes(provider);
export const isValidFormFlow = (flow) =>
  Object.values(FORM_FLOWS).includes(flow);

// Default values
export const DEFAULT_FORM_SCHEMA = {
  title: "",
  description: "",
  language: LANGUAGES.EN,
  fields: [],
  settings: {
    collect_email: false,
    allow_multiple_submissions: true,
    confirmation_message: null,
    payment: {
      enabled: false,
    },
    show_progress_bar: false,
    randomize_fields: false,
    redirect_url: null,
    notifications: {
      enabled: false,
      email: null,
      subject: null,
    },
  },
  theme: {
    primary_color: "#7C5CFF",
    background_color: "#070910",
    font_family: "Inter",
  },
};

export const DEFAULT_USER_PREFERENCES = {
  theme: "dark",
  language: LANGUAGES.EN,
  animations_enabled: true,
  notifications_enabled: true,
  default_form_settings: {
    collect_email: true,
    allow_multiple_submissions: true,
    show_progress_bar: true,
  },
};
