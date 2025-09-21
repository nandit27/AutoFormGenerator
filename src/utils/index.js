import {
  FIELD_TYPES,
  VALIDATION_PATTERNS,
  GOOGLE_FORMS_MAPPINGS,
} from "../types/index.js";

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Generate UUID v4
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Convert string to snake_case
export const toSnakeCase = (str) => {
  return str
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join("_");
};

// Convert string to Title Case
export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Format date
export const formatDate = (date, format = "YYYY-MM-DD") => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return formatDate(date, "MMM DD, YYYY");
  }
};

// Validate field value
export const validateField = (field, value) => {
  const errors = [];

  // Check required fields
  if (field.required && (!value || value.toString().trim() === "")) {
    errors.push(`${field.label} is required`);
    return errors;
  }

  // Skip validation if field is empty and not required
  if (!value || value.toString().trim() === "") {
    return errors;
  }

  // Type-specific validation
  switch (field.type) {
    case FIELD_TYPES.EMAIL:
      if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
        errors.push(`${field.label} must be a valid email address`);
      }
      break;

    case FIELD_TYPES.PHONE:
      if (!VALIDATION_PATTERNS.PHONE.test(value.replace(/[\s\-\(\)]/g, ""))) {
        errors.push(`${field.label} must be a valid phone number`);
      }
      break;

    case FIELD_TYPES.NUMBER:
      if (!VALIDATION_PATTERNS.NUMBER.test(value)) {
        errors.push(`${field.label} must be a valid number`);
      }
      break;

    case FIELD_TYPES.URL:
      if (!VALIDATION_PATTERNS.URL.test(value)) {
        errors.push(`${field.label} must be a valid URL`);
      }
      break;
  }

  // Custom pattern validation
  if (field.validation?.pattern) {
    const pattern = new RegExp(field.validation.pattern);
    if (!pattern.test(value)) {
      errors.push(
        field.validation.message || `${field.label} format is invalid`,
      );
    }
  }

  // Min/Max validation
  if (field.validation?.min !== undefined) {
    if (field.type === FIELD_TYPES.NUMBER) {
      if (parseFloat(value) < field.validation.min) {
        errors.push(`${field.label} must be at least ${field.validation.min}`);
      }
    } else if (value.length < field.validation.min) {
      errors.push(
        `${field.label} must be at least ${field.validation.min} characters`,
      );
    }
  }

  if (field.validation?.max !== undefined) {
    if (field.type === FIELD_TYPES.NUMBER) {
      if (parseFloat(value) > field.validation.max) {
        errors.push(`${field.label} must be at most ${field.validation.max}`);
      }
    } else if (value.length > field.validation.max) {
      errors.push(
        `${field.label} must be at most ${field.validation.max} characters`,
      );
    }
  }

  return errors;
};

// Validate entire form
export const validateForm = (schema, formData) => {
  const errors = {};
  let isValid = true;

  schema.fields.forEach((field) => {
    const value = formData[field.id];
    const fieldErrors = validateField(field, value);

    if (fieldErrors.length > 0) {
      errors[field.id] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Format form data for submission
export const formatFormData = (schema, rawData) => {
  const formattedData = {};

  schema.fields.forEach((field) => {
    const value = rawData[field.id];

    if (value !== undefined && value !== null && value !== "") {
      switch (field.type) {
        case FIELD_TYPES.NUMBER:
          formattedData[field.id] = parseFloat(value);
          break;
        case FIELD_TYPES.CHECKBOX:
          formattedData[field.id] = Array.isArray(value) ? value : [value];
          break;
        case FIELD_TYPES.DATE:
          formattedData[field.id] = new Date(value).toISOString().split("T")[0];
          break;
        case FIELD_TYPES.DATETIME:
          formattedData[field.id] = new Date(value).toISOString();
          break;
        default:
          formattedData[field.id] = value;
      }
    }
  });

  return formattedData;
};

// Convert form schema to Google Forms format
export const convertToGoogleFormsFormat = (schema, includeTitle = true) => {
  const requests = [];

  // Add description (and optionally title) - only if we have content to update
  if (schema.description || includeTitle) {
    const info = {};
    const updateMaskFields = [];

    if (includeTitle && schema.title) {
      info.title = schema.title;
      updateMaskFields.push("title");
    }

    if (schema.description) {
      info.description = schema.description;
      updateMaskFields.push("description");
    }

    if (updateMaskFields.length > 0) {
      requests.push({
        updateFormInfo: {
          info: info,
          updateMask: updateMaskFields.join(","),
        },
      });
    }
  }

  // Add fields
  schema.fields.forEach((field, index) => {
    const googleFieldType = GOOGLE_FORMS_MAPPINGS[field.type];

    if (!googleFieldType) {
      console.warn(`Field type ${field.type} not supported in Google Forms`);
      return;
    }

    const createItemRequest = {
      createItem: {
        item: {
          title: field.label,
          description: field.description || "",
          questionItem: {
            question: {
              required: field.required || false,
            },
          },
        },
        location: {
          index: index,
        },
      },
    };

    // Add field type specific configuration
    switch (field.type) {
      case FIELD_TYPES.TEXT:
        createItemRequest.createItem.item.questionItem.question.textQuestion = {
          paragraph: false,
        };
        break;

      case FIELD_TYPES.TEXTAREA:
        createItemRequest.createItem.item.questionItem.question.textQuestion = {
          paragraph: true,
        };
        break;

      case FIELD_TYPES.EMAIL:
        createItemRequest.createItem.item.questionItem.question.textQuestion = {
          paragraph: false,
        };
        // Note: Email validation will be handled by Google Forms automatically
        // when users enter email-like text, or we can add it in a separate update
        break;

      case FIELD_TYPES.PHONE:
      case FIELD_TYPES.NUMBER:
        createItemRequest.createItem.item.questionItem.question.textQuestion = {
          paragraph: false,
        };
        break;

      case FIELD_TYPES.SELECT:
        createItemRequest.createItem.item.questionItem.question.choiceQuestion =
          {
            type: "DROP_DOWN",
            options: field.options?.map((option) => ({ value: option })) || [],
          };
        break;

      case FIELD_TYPES.RADIO:
        createItemRequest.createItem.item.questionItem.question.choiceQuestion =
          {
            type: "RADIO",
            options: field.options?.map((option) => ({ value: option })) || [],
          };
        break;

      case FIELD_TYPES.CHECKBOX:
        createItemRequest.createItem.item.questionItem.question.choiceQuestion =
          {
            type: "CHECKBOX",
            options: field.options?.map((option) => ({ value: option })) || [],
          };
        break;

      case FIELD_TYPES.DATE:
        createItemRequest.createItem.item.questionItem.question.dateQuestion = {
          includeTime: false,
          includeYear: true,
        };
        break;

      case FIELD_TYPES.TIME:
        createItemRequest.createItem.item.questionItem.question.timeQuestion = {
          duration: false,
        };
        break;

      case FIELD_TYPES.FILE:
        createItemRequest.createItem.item.questionItem.question.fileUploadQuestion =
          {
            folderId: "", // Will be set by Google Forms
            maxFiles: 10,
            maxFileSize: 10485760, // 10MB
            types: ["ANY"],
          };
        break;

      default:
        // Fallback to short answer text question
        createItemRequest.createItem.item.questionItem.question.textQuestion = {
          paragraph: false,
        };
        break;
    }

    requests.push(createItemRequest);
  });

  return requests;
};

// Calculate form completion percentage
export const calculateCompletionPercentage = (schema, formData) => {
  const totalFields = schema.fields.length;
  let completedFields = 0;

  schema.fields.forEach((field) => {
    const value = formData[field.id];
    if (value !== undefined && value !== null && value !== "") {
      completedFields++;
    }
  });

  return Math.round((completedFields / totalFields) * 100);
};

// Get field default value
export const getFieldDefaultValue = (field) => {
  switch (field.type) {
    case FIELD_TYPES.CHECKBOX:
      return [];
    case FIELD_TYPES.NUMBER:
      return "";
    case FIELD_TYPES.DATE:
    case FIELD_TYPES.DATETIME:
    case FIELD_TYPES.TIME:
      return "";
    default:
      return "";
  }
};

// Parse error message
export const parseErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return "An unexpected error occurred";
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Download JSON file
export const downloadJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

// Get contrast color
export const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// Check if field should be shown based on conditional logic
export const shouldShowField = (field, formData) => {
  if (!field.conditional) return true;

  const {
    field: dependentField,
    value: expectedValue,
    operator = "equals",
  } = field.conditional;
  const actualValue = formData[dependentField];

  switch (operator) {
    case "equals":
      return actualValue === expectedValue;
    case "not_equals":
      return actualValue !== expectedValue;
    case "contains":
      return actualValue && actualValue.toString().includes(expectedValue);
    case "greater_than":
      return parseFloat(actualValue) > parseFloat(expectedValue);
    case "less_than":
      return parseFloat(actualValue) < parseFloat(expectedValue);
    case "is_empty":
      return !actualValue || actualValue.toString().trim() === "";
    case "is_not_empty":
      return actualValue && actualValue.toString().trim() !== "";
    default:
      return true;
  }
};

// Get visible fields based on conditional logic
export const getVisibleFields = (schema, formData) => {
  return schema.fields.filter((field) => shouldShowField(field, formData));
};

// Calculate form analytics
export const calculateFormAnalytics = (responses) => {
  if (!responses || responses.length === 0) {
    return {
      totalResponses: 0,
      averageCompletionTime: 0,
      abandonmentRate: 0,
      fieldStats: {},
    };
  }

  const totalResponses = responses.length;
  const completionTimes = responses
    .map((r) => r.metadata?.completion_time)
    .filter((t) => t);

  const averageCompletionTime =
    completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) /
        completionTimes.length
      : 0;

  // Calculate field completion rates
  const fieldStats = {};
  responses.forEach((response) => {
    Object.keys(response.answers || {}).forEach((fieldId) => {
      if (!fieldStats[fieldId]) {
        fieldStats[fieldId] = { completed: 0, total: totalResponses };
      }
      fieldStats[fieldId].completed++;
    });
  });

  return {
    totalResponses,
    averageCompletionTime: Math.round(averageCompletionTime / 1000), // Convert to seconds
    abandonmentRate: 0, // Would need additional tracking
    fieldStats,
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};
