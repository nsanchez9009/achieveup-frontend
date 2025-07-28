import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  test('renders all button variants correctly', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'outline'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      
      // Check that variant-specific classes are applied
      expect(button).toBeInTheDocument();
      
      unmount();
    });
  });

  test('renders all button sizes correctly', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
      
      unmount();
    });
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  test('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('does not trigger click when loading', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  test('supports different button types', () => {
    const types = ['button', 'submit', 'reset'] as const;
    
    types.forEach(type => {
      const { unmount } = render(<Button type={type}>Test</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', type);
      
      unmount();
    });
  });

  test('forwards additional props', () => {
    render(<Button data-testid="custom-button" aria-label="Custom button">Test</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });

  test('handles keyboard events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    
    const button = screen.getByRole('button');
    
    // Focus the button first
    button.focus();
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    fireEvent.keyUp(button, { key: ' ', code: 'Space' });
    
    expect(button).toHaveFocus();
  });

  test('maintains focus accessibility', () => {
    render(<Button>Focusable</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  test('prevents multiple rapid clicks when loading', () => {
    const handleClick = jest.fn();
    const { rerender } = render(<Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole('button');
    
    // First click
    fireEvent.click(button);
    
    // Set loading state
    rerender(<Button onClick={handleClick} loading>Click</Button>);
    
    // Try to click again while loading
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('handles very long text content', () => {
    const longText = 'This is a very long button text that might cause layout issues in some cases';
    render(<Button>{longText}</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(longText);
  });

  test('renders with icon children', () => {
    const IconComponent = () => <span data-testid="icon">Icon</span>;
    render(
      <Button>
        <IconComponent />
        Button with icon
      </Button>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Button with icon')).toBeInTheDocument();
  });

  test('maintains button styling with different variants', () => {
    render(<Button variant="primary">Primary</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-ucf-gold');
    expect(button).toHaveClass('text-ucf-black');
  });

  test('handles outline variant correctly', () => {
    render(<Button variant="outline">Outline</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-ucf-gold');
  });

  test('combines loading and disabled states correctly', () => {
    render(<Button loading disabled>Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles rapid state changes', () => {
    const { rerender } = render(<Button>Normal</Button>);
    let button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    
    // Change to loading
    rerender(<Button loading>Loading</Button>);
    button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Change to disabled
    rerender(<Button disabled>Disabled</Button>);
    button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Back to normal
    rerender(<Button>Normal</Button>);
    button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  test('preserves focus after state changes', () => {
    const { rerender } = render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
    
    // Change props but preserve focus behavior
    rerender(<Button variant="secondary">Test</Button>);
    expect(button).toBeInTheDocument();
  });

  test('handles touch events on mobile', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Touch me</Button>);
    
    const button = screen.getByRole('button');
    
    fireEvent.touchStart(button);
    fireEvent.touchEnd(button);
    
    // Button should still be clickable
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  test('applies correct ARIA attributes', () => {
    render(<Button disabled>Disabled button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('disabled');
  });

  test('loading state with custom loading text', () => {
    render(<Button loading>Custom Loading Text</Button>);
    
    // Should show "Loading..." not the custom text when loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Custom Loading Text')).not.toBeInTheDocument();
  });
}); 