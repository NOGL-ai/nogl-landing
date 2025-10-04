import { render, screen } from '@testing-library/react';

// Simple test component
const TestButton = ({ children, onClick, disabled = false }: any) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<TestButton>Click me</TestButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<TestButton onClick={handleClick}>Click me</TestButton>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<TestButton disabled>Disabled Button</TestButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
