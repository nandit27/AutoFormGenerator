import { FIELD_TYPES, GOOGLE_FORMS_MAPPINGS } from '../types/index.js';

/**
 * Google Forms Validation Utility
 * Validates form schemas for Google Forms API compatibility
 */
class GoogleFormsValidator {
  constructor() {
    this.supportedTypes = Object.keys(GOOGLE_FORMS_MAPPINGS);
    this.maxFieldsPerForm = 100;
    this.maxOptionsPerField = 1000;
    this.maxTitleLength = 300;
    this.maxDescriptionLength = 4096;
    this.maxFieldLabelLength = 300;
    this.maxFieldDescriptionLength = 1000;
    this.maxOptionLength = 300;
  }

  /**
   * Validate a complete form schema for Google Forms compatibility
   * @param {Object} schema - The form schema to validate
   * @returns {Object} Validation result with errors and warnings
   */
  validateSchema(schema) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      summary: {
        totalFields: 0,
        supportedFields: 0,
        unsupportedFields: 0,
        fieldsWithIssues: 0
      }
    };

    try {
      // Validate basic schema structure
      this.validateBasicStructure(schema, result);

      // Validate form metadata
      this.validateFormMetadata(schema, result);

      // Validate fields
      if (schema.fields && Array.isArray(schema.fields)) {
        result.summary.totalFields = schema.fields.length;
        this.validateFields(schema.fields, result);
      }

      // Final validation checks
      this.performFinalChecks(schema, result);

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    // Update valid status based on errors
    result.valid = result.errors.length === 0;

    return result;
  }

  /**
   * Validate basic schema structure
   * @private
   */
  validateBasicStructure(schema, result) {
    if (!schema || typeof schema !== 'object') {
      result.errors.push('Schema must be a valid object');
      return;
    }

    if (!schema.title || typeof schema.title !== 'string') {
      result.errors.push('Schema must have a valid title');
    }

    if (!schema.fields || !Array.isArray(schema.fields)) {
      result.errors.push('Schema must have a fields array');
    }
  }

  /**
   * Validate form metadata (title, description, etc.)
   * @private
   */
  validateFormMetadata(schema, result) {
    // Title validation
    if (schema.title) {
      if (schema.title.length > this.maxTitleLength) {
        result.errors.push(`Form title exceeds maximum length of ${this.maxTitleLength} characters`);
      }
      if (schema.title.trim() === '') {
        result.errors.push('Form title cannot be empty');
      }
    }

    // Description validation
    if (schema.description && schema.description.length > this.maxDescriptionLength) {
      result.warnings.push(`Form description exceeds recommended length of ${this.maxDescriptionLength} characters`);
    }
  }

  /**
   * Validate all fields in the schema
   * @private
   */
  validateFields(fields, result) {
    if (fields.length > this.maxFieldsPerForm) {
      result.errors.push(`Form exceeds maximum of ${this.maxFieldsPerForm} fields`);
    }

    if (fields.length === 0) {
      result.warnings.push('Form has no fields');
    }

    fields.forEach((field, index) => {
      const fieldResult = this.validateField(field, index);

      if (fieldResult.supported) {
        result.summary.supportedFields++;
      } else {
        result.summary.unsupportedFields++;
      }

      if (fieldResult.errors.length > 0 || fieldResult.warnings.length > 0) {
        result.summary.fieldsWithIssues++;
      }

      // Merge field results into main result
      result.errors.push(...fieldResult.errors);
      result.warnings.push(...fieldResult.warnings);
    });
  }

  /**
   * Validate a single field
   * @private
   */
  validateField(field, index) {
    const fieldResult = {
      supported: false,
      errors: [],
      warnings: []
    };

    const fieldPrefix = `Field ${index + 1} (${field.label || field.id || 'unnamed'})`;

    // Basic field structure
    if (!field.id || typeof field.id !== 'string') {
      fieldResult.errors.push(`${fieldPrefix}: Field must have a valid id`);
    }

    if (!field.label || typeof field.label !== 'string') {
      fieldResult.errors.push(`${fieldPrefix}: Field must have a valid label`);
    }

    if (!field.type || typeof field.type !== 'string') {
      fieldResult.errors.push(`${fieldPrefix}: Field must have a valid type`);
    }

    // Field type support
    if (field.type && this.supportedTypes.includes(field.type)) {
      fieldResult.supported = true;
    } else if (field.type) {
      fieldResult.errors.push(`${fieldPrefix}: Field type '${field.type}' is not supported by Google Forms`);
    }

    // Field label length
    if (field.label && field.label.length > this.maxFieldLabelLength) {
      fieldResult.errors.push(`${fieldPrefix}: Label exceeds maximum length of ${this.maxFieldLabelLength} characters`);
    }

    // Field description length
    if (field.description && field.description.length > this.maxFieldDescriptionLength) {
      fieldResult.warnings.push(`${fieldPrefix}: Description exceeds recommended length of ${this.maxFieldDescriptionLength} characters`);
    }

    // Validate field-specific requirements
    this.validateFieldTypeSpecific(field, fieldResult, fieldPrefix);

    return fieldResult;
  }

  /**
   * Validate field type specific requirements
   * @private
   */
  validateFieldTypeSpecific(field, fieldResult, fieldPrefix) {
    switch (field.type) {
      case FIELD_TYPES.SELECT:
      case FIELD_TYPES.RADIO:
      case FIELD_TYPES.CHECKBOX:
        this.validateChoiceField(field, fieldResult, fieldPrefix);
        break;

      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.TEXTAREA:
        this.validateTextField(field, fieldResult, fieldPrefix);
        break;

      case FIELD_TYPES.EMAIL:
        this.validateEmailField(field, fieldResult, fieldPrefix);
        break;

      case FIELD_TYPES.NUMBER:
        this.validateNumberField(field, fieldResult, fieldPrefix);
        break;

      case FIELD_TYPES.DATE:
        this.validateDateField(field, fieldResult, fieldPrefix);
        break;

      case FIELD_TYPES.FILE:
        this.validateFileField(field, fieldResult, fieldPrefix);
        break;

      default:
        if (fieldResult.supported) {
          fieldResult.warnings.push(`${fieldPrefix}: Field type validation not implemented`);
        }
        break;
    }
  }

  /**
   * Validate choice fields (select, radio, checkbox)
   * @private
   */
  validateChoiceField(field, fieldResult, fieldPrefix) {
    if (!field.options || !Array.isArray(field.options)) {
      fieldResult.errors.push(`${fieldPrefix}: Choice field must have options array`);
      return;
    }

    if (field.options.length === 0) {
      fieldResult.errors.push(`${fieldPrefix}: Choice field must have at least one option`);
    }

    if (field.options.length > this.maxOptionsPerField) {
      fieldResult.errors.push(`${fieldPrefix}: Choice field exceeds maximum of ${this.maxOptionsPerField} options`);
    }

    field.options.forEach((option, optionIndex) => {
      if (!option || typeof option !== 'string') {
        fieldResult.errors.push(`${fieldPrefix}: Option ${optionIndex + 1} must be a valid string`);
      } else if (option.length > this.maxOptionLength) {
        fieldResult.warnings.push(`${fieldPrefix}: Option ${optionIndex + 1} exceeds recommended length of ${this.maxOptionLength} characters`);
      } else if (option.trim() === '') {
        fieldResult.errors.push(`${fieldPrefix}: Option ${optionIndex + 1} cannot be empty`);
      }
    });

    // Check for duplicate options
    const uniqueOptions = new Set(field.options);
    if (uniqueOptions.size !== field.options.length) {
      fieldResult.warnings.push(`${fieldPrefix}: Contains duplicate options`);
    }
  }

  /**
   * Validate text fields
   * @private
   */
  validateTextField(field, fieldResult, fieldPrefix) {
    if (field.validation) {
      if (field.validation.minLength && typeof field.validation.minLength !== 'number') {
        fieldResult.warnings.push(`${fieldPrefix}: Text validation minLength should be a number`);
      }
      if (field.validation.maxLength && typeof field.validation.maxLength !== 'number') {
        fieldResult.warnings.push(`${fieldPrefix}: Text validation maxLength should be a number`);
      }
    }
  }

  /**
   * Validate email fields
   * @private
   */
  validateEmailField(field, fieldResult, fieldPrefix) {
    // Email fields in Google Forms automatically validate email format
    if (field.validation && field.validation.pattern) {
      fieldResult.warnings.push(`${fieldPrefix}: Custom email validation patterns may not work in Google Forms`);
    }
  }

  /**
   * Validate number fields
   * @private
   */
  validateNumberField(field, fieldResult, fieldPrefix) {
    if (field.validation) {
      if (field.validation.min && typeof field.validation.min !== 'number') {
        fieldResult.warnings.push(`${fieldPrefix}: Number validation min should be a number`);
      }
      if (field.validation.max && typeof field.validation.max !== 'number') {
        fieldResult.warnings.push(`${fieldPrefix}: Number validation max should be a number`);
      }
    }
  }

  /**
   * Validate date fields
   * @private
   */
  validateDateField(field, fieldResult, fieldPrefix) {
    if (field.validation) {
      if (field.validation.minDate || field.validation.maxDate) {
        fieldResult.warnings.push(`${fieldPrefix}: Date range validation may have limited support in Google Forms`);
      }
    }
  }

  /**
   * Validate file upload fields
   * @private
   */
  validateFileField(field, fieldResult, fieldPrefix) {
    fieldResult.warnings.push(`${fieldPrefix}: File upload requires Google Drive permissions and may have limitations`);

    if (field.validation && field.validation.maxSize) {
      fieldResult.warnings.push(`${fieldPrefix}: File size validation is handled by Google Forms, custom limits may not apply`);
    }
  }

  /**
   * Perform final validation checks
   * @private
   */
  performFinalChecks(schema, result) {
    // Check for duplicate field IDs
    if (schema.fields) {
      const fieldIds = schema.fields.map(field => field.id).filter(Boolean);
      const uniqueIds = new Set(fieldIds);

      if (uniqueIds.size !== fieldIds.length) {
        result.errors.push('Form contains duplicate field IDs');
      }
    }

    // Check if form has at least one supported field
    if (result.summary.supportedFields === 0 && result.summary.totalFields > 0) {
      result.errors.push('Form contains no fields supported by Google Forms');
    }
  }

  /**
   * Get a list of supported field types
   * @returns {Array} Array of supported field types
   */
  getSupportedFieldTypes() {
    return [...this.supportedTypes];
  }

  /**
   * Check if a field type is supported
   * @param {string} fieldType - The field type to check
   * @returns {boolean} True if supported
   */
  isFieldTypeSupported(fieldType) {
    return this.supportedTypes.includes(fieldType);
  }

  /**
   * Get Google Forms mapping for a field type
   * @param {string} fieldType - The field type
   * @returns {string|null} Google Forms field type or null if unsupported
   */
  getGoogleFormsMapping(fieldType) {
    return GOOGLE_FORMS_MAPPINGS[fieldType] || null;
  }

  /**
   * Generate a validation report summary
   * @param {Object} validationResult - Result from validateSchema
   * @returns {string} Human-readable validation summary
   */
  generateValidationSummary(validationResult) {
    const { valid, errors, warnings, summary } = validationResult;

    let report = '=== Google Forms Validation Report ===\n\n';

    // Overall status
    report += `Status: ${valid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Total Fields: ${summary.totalFields}\n`;
    report += `Supported Fields: ${summary.supportedFields}\n`;
    report += `Unsupported Fields: ${summary.unsupportedFields}\n`;
    report += `Fields with Issues: ${summary.fieldsWithIssues}\n\n`;

    // Errors
    if (errors.length > 0) {
      report += '❌ ERRORS:\n';
      errors.forEach((error, index) => {
        report += `  ${index + 1}. ${error}\n`;
      });
      report += '\n';
    }

    // Warnings
    if (warnings.length > 0) {
      report += '⚠️  WARNINGS:\n';
      warnings.forEach((warning, index) => {
        report += `  ${index + 1}. ${warning}\n`;
      });
      report += '\n';
    }

    if (valid) {
      report += '✅ Form is compatible with Google Forms!';
    } else {
      report += '❌ Form has compatibility issues that must be resolved.';
    }

    return report;
  }
}

// Export singleton instance
const googleFormsValidator = new GoogleFormsValidator();
export default googleFormsValidator;

// Export class for custom instances
export { GoogleFormsValidator };

// Helper functions
export const validateForGoogleForms = (schema) => {
  return googleFormsValidator.validateSchema(schema);
};

export const isGoogleFormsCompatible = (schema) => {
  const result = googleFormsValidator.validateSchema(schema);
  return result.valid;
};

export const getGoogleFormsSupportedTypes = () => {
  return googleFormsValidator.getSupportedFieldTypes();
};
