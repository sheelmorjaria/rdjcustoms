import React from 'react';
import { sanitizeUserInput, escapeHtml } from '../../utils/sanitization';

/**
 * Higher-Order Component for automatic XSS protection
 * Wraps components to automatically sanitize props and prevent XSS attacks
 */
const withXSSProtection = (WrappedComponent, options = {}) => {
  const {
    sanitizeProps = true,
    sanitizeChildren = true,
    excludeProps = [],
    maxLength = 10000,
    allowHtml = false
  } = options;

  // Component name for debugging
  const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const XSSProtectedComponent = (props) => {
    // Sanitize all string props
    const sanitizedProps = sanitizeProps ? sanitizeComponentProps(props, {
      excludeProps,
      maxLength,
      allowHtml
    }) : props;

    // Sanitize children if they're strings
    const sanitizedChildren = sanitizeChildren && props.children
      ? sanitizeChildrenContent(props.children, { maxLength, allowHtml })
      : props.children;

    return (
      <WrappedComponent {...sanitizedProps}>
        {sanitizedChildren}
      </WrappedComponent>
    );
  };

  XSSProtectedComponent.displayName = `withXSSProtection(${componentName})`;

  return XSSProtectedComponent;
};

/**
 * Recursively sanitize component props
 */
const sanitizeComponentProps = (props, options) => {
  const { excludeProps, maxLength, allowHtml } = options;
  const sanitized = {};

  Object.keys(props).forEach(key => {
    // Skip excluded props and children (handled separately)
    if (excludeProps.includes(key) || key === 'children') {
      sanitized[key] = props[key];
      return;
    }

    const value = props[key];

    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = sanitizeUserInput(value, { maxLength, allowHtml });
    }
    // Recursively sanitize objects
    else if (value && typeof value === 'object' && !React.isValidElement(value)) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' 
            ? sanitizeUserInput(item, { maxLength, allowHtml })
            : item
        );
      } else {
        sanitized[key] = sanitizeComponentProps(value, options);
      }
    }
    // Keep other types as-is
    else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

/**
 * Sanitize children content recursively
 */
const sanitizeChildrenContent = (children, options) => {
  const { maxLength, allowHtml } = options;

  // Handle string children
  if (typeof children === 'string') {
    return sanitizeUserInput(children, { maxLength, allowHtml });
  }

  // Handle array of children
  if (Array.isArray(children)) {
    return React.Children.map(children, child => 
      sanitizeChildrenContent(child, options)
    );
  }

  // Handle React elements
  if (React.isValidElement(children)) {
    const props = sanitizeComponentProps(children.props, {
      excludeProps: [],
      maxLength,
      allowHtml
    });

    return React.cloneElement(
      children,
      props,
      sanitizeChildrenContent(children.props.children, options)
    );
  }

  return children;
};

/**
 * Hook for manual XSS protection in functional components
 */
export const useXSSProtection = (value, options = {}) => {
  const {
    maxLength = 10000,
    allowHtml = false,
    escapeOnly = false
  } = options;

  if (typeof value !== 'string') {
    return value;
  }

  if (escapeOnly) {
    return escapeHtml(value);
  }

  return sanitizeUserInput(value, { maxLength, allowHtml });
};

/**
 * Component for displaying user-generated content safely
 */
export const SafeContent = ({ 
  content, 
  as = 'div', 
  allowHtml = false,
  maxLength = 10000,
  ...props 
}) => {
  const sanitized = sanitizeUserInput(content, { allowHtml, maxLength });
  const Component = as;

  if (allowHtml) {
    return (
      <Component 
        {...props}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <Component {...props}>{sanitized}</Component>;
};

/**
 * Safe link component that prevents javascript: and data: URLs
 */
export const SafeLink = ({ href, children, ...props }) => {
  const isSafeUrl = (url) => {
    if (!url) return false;
    
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:'];
    const lowerUrl = url.toLowerCase().trim();
    
    return !dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
  };

  const safeHref = isSafeUrl(href) ? href : '#';

  return (
    <a 
      {...props} 
      href={safeHref}
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!isSafeUrl(href)) {
          e.preventDefault();
          console.warn('Unsafe URL blocked:', href);
        }
        if (props.onClick) {
          props.onClick(e);
        }
      }}
    >
      {children}
    </a>
  );
};

/**
 * Safe image component that validates src URLs
 */
export const SafeImage = ({ src, alt = '', onError, ...props }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Validate image URL
    if (src && !src.includes('javascript:') && !src.includes('data:text/html')) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc('');
      setHasError(true);
    }
  }, [src]);

  const handleError = (e) => {
    setHasError(true);
    setImgSrc(''); // Clear the source on error
    if (onError) {
      onError(e);
    }
  };

  if (hasError || !imgSrc) {
    return (
      <div 
        className="bg-gray-200 flex items-center justify-center"
        style={{ width: props.width || 200, height: props.height || 200 }}
      >
        <span className="text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <img 
      {...props}
      src={imgSrc}
      alt={escapeHtml(alt)}
      onError={handleError}
    />
  );
};

/**
 * Context provider for XSS protection settings
 */
const XSSProtectionContext = React.createContext({
  enabled: true,
  options: {
    maxLength: 10000,
    allowHtml: false
  }
});

export const XSSProtectionProvider = ({ children, enabled = true, options = {} }) => {
  const value = {
    enabled,
    options: {
      maxLength: 10000,
      allowHtml: false,
      ...options
    }
  };

  return (
    <XSSProtectionContext.Provider value={value}>
      {children}
    </XSSProtectionContext.Provider>
  );
};

export const useXSSProtectionContext = () => {
  return React.useContext(XSSProtectionContext);
};

/**
 * Form field wrapper with built-in XSS protection
 */
export const SafeFormField = ({ 
  type = 'text',
  value,
  onChange,
  maxLength = 1000,
  ...props 
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    const sanitized = escapeHtml(newValue);
    
    // Create a new event with sanitized value
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitized
      }
    };
    
    onChange(sanitizedEvent);
  };

  return (
    <input
      {...props}
      type={type}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
};

// Export the main HOC as default
export default withXSSProtection;