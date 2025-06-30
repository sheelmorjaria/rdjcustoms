import { useState, useCallback, useMemo } from 'react';
import { sanitizeFormData } from '../utils/sanitization';

/**
 * Custom hook for secure form handling with built-in validation and sanitization
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationConfig - Configuration for field validation and sanitization
 * @param {Function} onSubmit - Submit handler function
 * @returns {Object} Form state and handlers
 */
export const useSecureForm = (initialValues = {}, validationConfig = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate and sanitize a single field
  const validateField = useCallback((fieldName, fieldValue) => {
    const config = validationConfig[fieldName] || {};
    const result = sanitizeFormData({ [fieldName]: fieldValue }, { [fieldName]: config });
    
    return {
      value: result.data[fieldName],
      error: result.errors[fieldName] || null,
      isValid: !result.errors[fieldName]
    };
  }, [validationConfig]);

  // Handle input change with real-time validation
  const handleChange = useCallback((fieldName) => (event) => {
    const inputValue = event.target.value;
    const validation = validateField(fieldName, inputValue);
    
    setValues(prev => ({
      ...prev,
      [fieldName]: validation.value
    }));

    // Update errors for this field
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.error
    }));
  }, [validateField]);

  // Handle input blur (mark as touched)
  const handleBlur = useCallback((fieldName) => () => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Re-validate on blur if field has been touched
    const validation = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.error
    }));
  }, [validateField, values]);

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName, value) => {
    const validation = validateField(fieldName, value);
    
    setValues(prev => ({
      ...prev,
      [fieldName]: validation.value
    }));

    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.error
    }));
  }, [validateField]);

  // Set field error programmatically
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const result = sanitizeFormData(values, validationConfig);
    setErrors(result.errors);
    return result;
  }, [values, validationConfig]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all fields
      const validation = validateAll();
      
      if (!validation.isValid) {
        // Mark all fields as touched to show errors
        setTouched(Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}));
        
        setIsSubmitting(false);
        return;
      }

      // Call the provided submit handler with sanitized data
      if (onSubmit) {
        await onSubmit(validation.data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle submission errors
      if (error.message) {
        setErrors(prev => ({
          ...prev,
          submit: error.message
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit]);

  // Get field props for easy binding to inputs
  const getFieldProps = useCallback((fieldName) => ({
    name: fieldName,
    value: values[fieldName] || '',
    onChange: handleChange(fieldName),
    onBlur: handleBlur(fieldName),
    'aria-invalid': !!(touched[fieldName] && errors[fieldName]),
    'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
  }), [values, handleChange, handleBlur, touched, errors]);

  // Get error message for a field
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [touched, errors]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName) => {
    return !!(touched[fieldName] && errors[fieldName]);
  }, [touched, errors]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues]);

  // Get form props for easy binding to form element
  const getFormProps = useCallback(() => ({
    onSubmit: handleSubmit,
    noValidate: true, // We handle validation ourselves
  }), [handleSubmit]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,

    // Field helpers
    getFieldProps,
    getFieldError,
    hasFieldError,
    setFieldValue,
    setFieldError,

    // Form helpers
    getFormProps,
    handleSubmit,
    resetForm,
    validateAll,

    // Low-level handlers (if needed)
    handleChange,
    handleBlur,
  };
};

export default useSecureForm;