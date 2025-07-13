import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import withXSSProtection, {
  useXSSProtection,
  SafeContent,
  SafeLink,
  SafeImage,
  XSSProtectionProvider,
  useXSSProtectionContext,
  SafeFormField
} from '../withXSSProtection';
import * as sanitizationUtils from '../../../utils/sanitization';

// Mock the sanitization utilities
vi.mock('../../../utils/sanitization', () => ({
  sanitizeUserInput: vi.fn((input) => input.replace(/<script>/gi, '')),
  escapeHtml: vi.fn((input) => input.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
}));

describe('withXSSProtection HOC', () => {
  // Test component to wrap
  const TestComponent = ({ text, data, children }) => (
    <div>
      <span data-testid="text">{text}</span>
      <span data-testid="data">{JSON.stringify(data)}</span>
      <span data-testid="children">{children}</span>
    </div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize string props by default', () => {
    const ProtectedComponent = withXSSProtection(TestComponent);
    render(
      <ProtectedComponent text="<script>alert('xss')</script>Hello" data={{ safe: true }}>
        Children content
      </ProtectedComponent>
    );

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      "<script>alert('xss')</script>Hello",
      expect.any(Object)
    );
  });

  it('should not sanitize props when sanitizeProps is false', () => {
    const ProtectedComponent = withXSSProtection(TestComponent, { 
      sanitizeProps: false, 
      sanitizeChildren: false 
    });
    render(
      <ProtectedComponent text="<script>alert('xss')</script>Hello">
        Children
      </ProtectedComponent>
    );

    expect(sanitizationUtils.sanitizeUserInput).not.toHaveBeenCalled();
  });

  it('should exclude specified props from sanitization', () => {
    const ProtectedComponent = withXSSProtection(TestComponent, { excludeProps: ['text'] });
    render(
      <ProtectedComponent text="<script>alert('xss')</script>" data="should be sanitized">
        Children
      </ProtectedComponent>
    );

    // Text should not be sanitized
    expect(sanitizationUtils.sanitizeUserInput).not.toHaveBeenCalledWith(
      "<script>alert('xss')</script>",
      expect.any(Object)
    );
    // Data should be sanitized
    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      "should be sanitized",
      expect.any(Object)
    );
  });

  it('should sanitize nested object props', () => {
    const ProtectedComponent = withXSSProtection(TestComponent);
    const nestedData = {
      level1: {
        text: '<script>nested xss</script>',
        level2: {
          text: '<img src=x onerror=alert(1)>'
        }
      }
    };

    render(<ProtectedComponent data={nestedData} />);

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      '<script>nested xss</script>',
      expect.any(Object)
    );
    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      '<img src=x onerror=alert(1)>',
      expect.any(Object)
    );
  });

  it('should sanitize array props', () => {
    const ProtectedComponent = withXSSProtection(TestComponent);
    const arrayData = ['<script>item1</script>', 'safe item', '<img onerror=alert(1)>'];

    render(<ProtectedComponent data={arrayData} />);

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      '<script>item1</script>',
      expect.any(Object)
    );
    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      '<img onerror=alert(1)>',
      expect.any(Object)
    );
  });

  it('should sanitize children when sanitizeChildren is true', () => {
    const ProtectedComponent = withXSSProtection(TestComponent);
    render(
      <ProtectedComponent>
        {'<script>child xss</script>'}
      </ProtectedComponent>
    );

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      '<script>child xss</script>',
      expect.any(Object)
    );
  });

  it('should handle React element children correctly', () => {
    const ProtectedComponent = withXSSProtection(TestComponent);
    render(
      <ProtectedComponent>
        <div data-dangerous="<script>xss</script>">
          {'<script>nested child</script>'}
        </div>
      </ProtectedComponent>
    );

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      '<script>nested child</script>',
      expect.any(Object)
    );
  });

  it('should preserve display name for debugging', () => {
    const NamedComponent = () => <div>Test</div>;
    NamedComponent.displayName = 'MyComponent';
    
    const ProtectedComponent = withXSSProtection(NamedComponent);
    expect(ProtectedComponent.displayName).toBe('withXSSProtection(MyComponent)');
  });
});

describe('useXSSProtection hook', () => {
  it('should sanitize string values', () => {
    const TestComponent = () => {
      const sanitized = useXSSProtection('<script>alert("xss")</script>Hello');
      return <div>{sanitized}</div>;
    };

    render(<TestComponent />);
    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalled();
  });

  it('should return non-string values as-is', () => {
    const TestComponent = () => {
      const obj = { test: true };
      const sanitized = useXSSProtection(obj);
      return <div>{JSON.stringify(sanitized)}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('{"test":true}')).toBeInTheDocument();
  });

  it('should escape HTML when escapeOnly is true', () => {
    const TestComponent = () => {
      const escaped = useXSSProtection('<div>Test</div>', { escapeOnly: true });
      return <div>{escaped}</div>;
    };

    render(<TestComponent />);
    expect(sanitizationUtils.escapeHtml).toHaveBeenCalledWith('<div>Test</div>');
  });
});

describe('SafeContent component', () => {
  it('should render sanitized content', () => {
    render(
      <SafeContent content="<script>alert('xss')</script>Safe content" />
    );

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      "<script>alert('xss')</script>Safe content",
      expect.objectContaining({ allowHtml: false })
    );
  });

  it('should render as specified element', () => {
    render(
      <SafeContent as="span" content="Test content" data-testid="safe-span" />
    );

    expect(screen.getByTestId('safe-span').tagName).toBe('SPAN');
  });

  it('should render HTML when allowHtml is true', () => {
    render(
      <SafeContent 
        content="<b>Bold text</b>" 
        allowHtml={true}
        data-testid="html-content"
      />
    );

    const element = screen.getByTestId('html-content');
    expect(element.innerHTML).toBe('<b>Bold text</b>');
  });

  it('should respect maxLength option', () => {
    render(
      <SafeContent content="Very long content" maxLength={5} />
    );

    expect(sanitizationUtils.sanitizeUserInput).toHaveBeenCalledWith(
      "Very long content",
      expect.objectContaining({ maxLength: 5 })
    );
  });
});

describe('SafeLink component', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should allow safe URLs', () => {
    render(
      <SafeLink href="https://example.com" data-testid="safe-link">
        Click me
      </SafeLink>
    );

    const link = screen.getByTestId('safe-link');
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('should block javascript: URLs', () => {
    render(
      <SafeLink href="javascript:alert('xss')" data-testid="unsafe-link">
        Click me
      </SafeLink>
    );

    const link = screen.getByTestId('unsafe-link');
    expect(link.getAttribute('href')).toBe('#');
  });

  it('should block data: URLs', () => {
    render(
      <SafeLink href="data:text/html,<script>alert('xss')</script>" data-testid="data-link">
        Click me
      </SafeLink>
    );

    const link = screen.getByTestId('data-link');
    expect(link.getAttribute('href')).toBe('#');
  });

  it('should warn when blocking unsafe URLs', () => {
    render(
      <SafeLink href="javascript:void(0)" data-testid="js-link">
        Click me
      </SafeLink>
    );

    const link = screen.getByTestId('js-link');
    fireEvent.click(link);

    expect(consoleSpy).toHaveBeenCalledWith('Unsafe URL blocked:', 'javascript:void(0)');
  });

  it('should add security attributes', () => {
    render(
      <SafeLink href="https://external.com" data-testid="external-link">
        External
      </SafeLink>
    );

    const link = screen.getByTestId('external-link');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should call custom onClick handler', () => {
    const handleClick = vi.fn();
    render(
      <SafeLink href="https://example.com" onClick={handleClick} data-testid="clickable">
        Click
      </SafeLink>
    );

    fireEvent.click(screen.getByTestId('clickable'));
    expect(handleClick).toHaveBeenCalled();
  });
});

describe('SafeImage component', () => {
  it('should render valid image URLs', () => {
    render(
      <SafeImage src="https://example.com/image.jpg" alt="Test image" data-testid="safe-img" />
    );

    const img = screen.getByTestId('safe-img');
    expect(img.getAttribute('src')).toBe('https://example.com/image.jpg');
  });

  it('should block javascript: URLs in src', () => {
    render(
      <SafeImage src="javascript:alert('xss')" alt="Unsafe" />
    );

    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  it('should block data:text/html URLs', () => {
    render(
      <SafeImage src="data:text/html,<script>alert('xss')</script>" alt="Data URL" />
    );

    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  it('should allow data:image URLs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS';
    render(
      <SafeImage src={dataUrl} alt="Data image" data-testid="data-img" />
    );

    const img = screen.getByTestId('data-img');
    expect(img.getAttribute('src')).toBe(dataUrl);
  });

  it('should escape alt text', () => {
    render(
      <SafeImage 
        src="https://example.com/img.jpg" 
        alt="<script>alert('xss')</script>" 
        data-testid="escaped-alt"
      />
    );

    const img = screen.getByTestId('escaped-alt');
    expect(sanitizationUtils.escapeHtml).toHaveBeenCalledWith("<script>alert('xss')</script>");
  });

  it('should handle image load errors', () => {
    const handleError = vi.fn();
    render(
      <SafeImage 
        src="https://example.com/broken.jpg" 
        onError={handleError}
        data-testid="error-img"
      />
    );

    const img = screen.getByTestId('error-img');
    fireEvent.error(img);

    expect(handleError).toHaveBeenCalled();
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  it('should show placeholder with custom dimensions', () => {
    render(
      <SafeImage src="javascript:void(0)" width={300} height={200} />
    );

    const placeholder = screen.getByText('Image unavailable').parentElement;
    expect(placeholder.style.width).toBe('300px');
    expect(placeholder.style.height).toBe('200px');
  });
});

describe('XSSProtectionProvider and Context', () => {
  it('should provide default context values', () => {
    const TestComponent = () => {
      const context = useXSSProtectionContext();
      return (
        <div>
          <span data-testid="enabled">{String(context.enabled)}</span>
          <span data-testid="maxLength">{context.options.maxLength}</span>
        </div>
      );
    };

    render(
      <XSSProtectionProvider>
        <TestComponent />
      </XSSProtectionProvider>
    );

    expect(screen.getByTestId('enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('maxLength')).toHaveTextContent('10000');
  });

  it('should allow custom options', () => {
    const TestComponent = () => {
      const context = useXSSProtectionContext();
      return (
        <div>
          <span data-testid="enabled">{String(context.enabled)}</span>
          <span data-testid="allowHtml">{String(context.options.allowHtml)}</span>
        </div>
      );
    };

    render(
      <XSSProtectionProvider enabled={false} options={{ allowHtml: true }}>
        <TestComponent />
      </XSSProtectionProvider>
    );

    expect(screen.getByTestId('enabled')).toHaveTextContent('false');
    expect(screen.getByTestId('allowHtml')).toHaveTextContent('true');
  });
});

describe('SafeFormField component', () => {
  it('should sanitize input values', () => {
    const handleChange = vi.fn();
    render(
      <SafeFormField 
        value="" 
        onChange={handleChange}
        data-testid="safe-input"
      />
    );

    const input = screen.getByTestId('safe-input');
    fireEvent.change(input, { target: { value: '<script>alert("xss")</script>' } });

    expect(sanitizationUtils.escapeHtml).toHaveBeenCalledWith('<script>alert("xss")</script>');
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: '&lt;script&gt;alert("xss")&lt;/script&gt;'
        })
      })
    );
  });

  it('should respect maxLength prop', () => {
    render(
      <SafeFormField 
        value="" 
        onChange={() => {}}
        maxLength={50}
        data-testid="limited-input"
      />
    );

    const input = screen.getByTestId('limited-input');
    expect(input.getAttribute('maxLength')).toBe('50');
  });

  it('should support different input types', () => {
    render(
      <SafeFormField 
        type="email"
        value="test@example.com" 
        onChange={() => {}}
        data-testid="email-input"
      />
    );

    const input = screen.getByTestId('email-input');
    expect(input.getAttribute('type')).toBe('email');
  });
});