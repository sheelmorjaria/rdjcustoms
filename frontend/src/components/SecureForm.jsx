import React from 'react';
import PropTypes from 'prop-types';
import { useSecureForm } from '../hooks/useSecureForm';

/**
 * Secure form component with built-in validation and sanitization
 * Demonstrates best practices for form security
 */
const SecureForm = ({ 
  initialValues = {},
  validationConfig = {},
  onSubmit,
  children,
  className = '',
  title,
  submitText = 'Submit',
  resetText = 'Reset',
  showReset = false
}) => {
  const {
    values,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    getFormProps,
    getFieldProps,
    getFieldError,
    hasFieldError,
    resetForm,
    setFieldValue
  } = useSecureForm(initialValues, validationConfig, onSubmit);

  // Render field with error handling
  const renderField = (fieldConfig) => {
    const { name, label, type = 'text', placeholder, required = false, ...fieldProps } = fieldConfig;
    const fieldError = getFieldError(name);
    const hasError = hasFieldError(name);

    return (
      <div key={name} className="space-y-1">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${hasError 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
          {...getFieldProps(name)}
          {...fieldProps}
        />
        
        {fieldError && (
          <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h2>
      )}

      <form {...getFormProps()} className="space-y-4">
        {/* Render children if provided, otherwise render default fields */}
        {children ? 
          children({ values, errors, getFieldProps, getFieldError, hasFieldError, setFieldValue }) :
          Object.keys(validationConfig).map(fieldName => 
            renderField({ 
              name: fieldName, 
              label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
              ...validationConfig[fieldName] 
            })
          )
        }

        {/* Form-level error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`
              flex-1 py-2 px-4 rounded-md text-white font-medium
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isSubmitting || !isValid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }
            `}
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </button>

          {showReset && (
            <button
              type="button"
              onClick={resetForm}
              disabled={!isDirty || isSubmitting}
              className={`
                px-4 py-2 rounded-md font-medium border
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${!isDirty || isSubmitting
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                }
              `}
            >
              {resetText}
            </button>
          )}
        </div>
      </form>

      {/* Security notice */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-600">
          🔒 This form uses advanced security measures including input sanitization, 
          XSS prevention, and SQL injection protection.
        </p>
      </div>
    </div>
  );
};

SecureForm.propTypes = {
  initialValues: PropTypes.object,
  validationConfig: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.string,
  submitText: PropTypes.string,
  resetText: PropTypes.string,
  showReset: PropTypes.bool,
};

export default SecureForm;