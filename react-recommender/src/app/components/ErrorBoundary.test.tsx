import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders children with custom fallback when no error occurs', () => {
      const customFallback = <div>Custom fallback</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Custom fallback')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays default error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('The recommendation widget encountered an unexpected error.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('displays custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('displays error details in expandable section', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const detailsElement = screen.getByText('Error Details (Click to expand)');
      expect(detailsElement).toBeInTheDocument();
      fireEvent.click(detailsElement);
      
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('logs error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Recovery', () => {
    it('allows retry by resetting error state', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('reloads page when reload button is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload Page');
      fireEvent.click(reloadButton);
      
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Error Information Display', () => {
    it('displays error message when available', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const detailsElement = screen.getByText('Error Details (Click to expand)');
      fireEvent.click(detailsElement);
      
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('displays stack trace when available', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const detailsElement = screen.getByText('Error Details (Click to expand)');
      fireEvent.click(detailsElement);
      expect(screen.getByText(/Stack Trace:/)).toBeInTheDocument();
    });

    it('handles errors without messages gracefully', () => {
      const ThrowErrorWithoutMessage = () => {
        const error = new Error();
        error.message = '';
        throw error;
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );
      const detailsElement = screen.getByText('Error Details (Click to expand)');
      fireEvent.click(detailsElement);
      
      expect(screen.getByText('Unknown error')).toBeInTheDocument();
    });
  });

  describe('Styling and Accessibility', () => {
    it('has proper error styling classes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = document.querySelector('.error-boundary-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('p-6', 'bg-red-50', 'border', 'border-red-200', 'rounded-lg');
    });

    it('has accessible button elements', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // Try Again and Reload Page
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('has proper heading structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByText('Something went wrong');
      expect(heading.tagName).toBe('H3');
    });
  });

  describe('Component State Management', () => {
    it('initializes with no error state', () => {
      const errorBoundary = new (ErrorBoundary as any)({});
      expect(errorBoundary.state.hasError).toBe(false);
    });

    it('updates state when error occurs', () => {
      const error = new Error('Test error');
      const newState = (ErrorBoundary as any).getDerivedStateFromError(error);
      
      expect(newState.hasError).toBe(true);
      expect(newState.error).toBe(error);
    });
  });
});

describe('withErrorBoundary HOC', () => {
  const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('HOC test error');
    }
    return <div>HOC test component</div>;
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent shouldThrow={false} />);
    
    expect(screen.getByText('HOC test component')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('uses custom fallback when provided', () => {
    const customFallback = <div>HOC custom fallback</div>;
    const WrappedComponent = withErrorBoundary(TestComponent, customFallback);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('HOC custom fallback')).toBeInTheDocument();
  });

  it('sets correct display name', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('handles components without display name', () => {
    const AnonymousComponent = () => <div>Anonymous</div>;
    const WrappedComponent = withErrorBoundary(AnonymousComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(AnonymousComponent)');
  });
});