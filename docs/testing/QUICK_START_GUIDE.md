# Testing Quick Start Guide

## Prerequisites

- Node.js 18+ (already configured in your project)
- Git (for pre-commit hooks)
- Docker (optional, for containerized testing)

## Installation

The testing dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Available Test Commands

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit:coverage
```

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests for specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari
```

### All Tests
```bash
# Run all tests
npm run test:all

# Run all tests with coverage
npm run test:coverage
```

## Writing Your First Test

### 1. Unit Test Example

Create a test file: `tests/unit/components/Button.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/atoms/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Test Example

Create a test file: `tests/integration/components/LoginForm.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/organisms/LoginForm';
import { server } from '@/tests/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LoginForm Integration', () => {
  it('submits login form successfully', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### 3. E2E Test Example

Create a test file: `tests/e2e/auth/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

## Test Data Management

### Using Fixtures

Create fixture files in `tests/fixtures/`:

```typescript
// tests/fixtures/user.fixture.ts
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
};

export const mockUsers = [mockUser, /* ... */];
```

### Using MSW for API Mocking

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        users: mockUsers
      })
    );
  }),
];
```

## Debugging Tests

### Unit/Integration Tests
```bash
# Run specific test file
npm run test:unit -- Button.test.tsx

# Run tests matching pattern
npm run test:unit -- --grep "Button"

# Debug mode
npm run test:unit -- --inspect-brk
```

### E2E Tests
```bash
# Run in headed mode to see browser
npm run test:e2e:headed

# Run specific test file
npm run test:e2e -- login.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

## Coverage Reports

After running tests with coverage, view the reports:

```bash
# Open coverage report in browser
npm run test:coverage:report
```

Coverage reports are generated in:
- `coverage/` - Unit test coverage
- `coverage-e2e/` - E2E test coverage

## Common Patterns

### Testing Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

test('useCounter hook', () => {
  const { result } = renderHook(() => useCounter(0));
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### Testing Context Providers
```typescript
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};
```

### Testing with Router
```typescript
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};
```

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in test configuration
2. **Async operations**: Use `waitFor` or `findBy` queries
3. **Mock not working**: Check MSW setup and handlers
4. **E2E tests failing**: Ensure test server is running

### Getting Help

- Check the [Testing Strategy](./TESTING_STRATEGY_2025.md) for detailed information
- Review existing test examples in the `tests/` directory
- Consult the [Testing Utilities](./TESTING_UTILITIES.md) guide

## Next Steps

1. Write tests for your components
2. Set up CI/CD integration
3. Add performance testing
4. Implement visual regression testing
5. Set up monitoring and alerting

---

*Happy Testing! 🧪*
