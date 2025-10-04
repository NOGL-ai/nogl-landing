# Testing Utilities Guide

## Overview

This guide covers the testing utilities and helpers available in our testing environment. These utilities are designed to make testing easier, more consistent, and more maintainable.

## Test Utilities (`tests/utils/test-utils.tsx`)

### Custom Render Function

Our custom render function includes all necessary providers:

```typescript
import { render, screen } from '@/tests/utils/test-utils';

test('component test', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mock Data Helpers

```typescript
import { createMockUser, createMockSession } from '@/tests/utils/test-utils';

const mockUser = createMockUser({ name: 'Custom User' });
const mockSession = createMockSession({ user: mockUser });
```

### Router Mocks

```typescript
import { mockRouter, mockNavigation } from '@/tests/utils/test-utils';

// Mock Next.js router
vi.mocked(mockRouter.push).mockImplementation(vi.fn());
```

### API Mocking Helpers

```typescript
import { mockFetch, mockFetchError } from '@/tests/utils/test-utils';

// Mock successful API response
mockFetch({ data: 'success' });

// Mock API error
mockFetchError('Network error');
```

## Accessibility Testing (`tests/utils/accessibility.ts`)

### Basic A11y Testing

```typescript
import { testA11y } from '@/tests/utils/accessibility';

test('component is accessible', async () => {
  await testA11y(<MyComponent />);
});
```

### Custom A11y Tests

```typescript
import { a11yTestPatterns } from '@/tests/utils/accessibility';

test('form has proper labels', () => {
  const { container } = render(<LoginForm />);
  a11yTestPatterns.formLabels(container);
});
```

### Skip Specific Rules

```typescript
await testA11y(<MyComponent />, {
  skip: ['color-contrast'] // Skip color contrast checks
});
```

## Performance Testing (`tests/utils/performance.ts`)

### Measure Render Time

```typescript
import { measureRenderTime } from '@/tests/utils/performance';

test('component renders quickly', async () => {
  const { average } = await measureRenderTime(() => {
    render(<MyComponent />);
  });
  
  expect(average).toBeLessThan(16); // 60fps
});
```

### Memory Leak Testing

```typescript
import { testMemoryLeaks } from '@/tests/utils/performance';

test('no memory leaks', async () => {
  const result = await testMemoryLeaks(
    () => createComponent(),
    (instance) => instance.cleanup(),
    100
  );
  
  expect(result?.hasLeak).toBe(false);
});
```

### Performance Budgets

```typescript
import { checkPerformanceBudgets } from '@/tests/utils/performance';

test('meets performance budgets', () => {
  const result = checkPerformanceBudgets({
    renderTime: 12,
    memoryUsage: 30 * 1024 * 1024,
  });
  
  expect(result.passed).toBe(true);
});
```

## Mock Service Worker (MSW)

### Server Setup

```typescript
import { server } from '@/tests/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Custom Handlers

```typescript
import { rest } from 'msw';

server.use(
  rest.get('/api/custom', (req, res, ctx) => {
    return res(ctx.json({ custom: 'data' }));
  })
);
```

## Test Fixtures

### User Fixtures

```typescript
import { mockUser, mockAdminUser, mockUsers } from '@/tests/fixtures/user.fixture';

test('user component', () => {
  render(<UserCard user={mockUser} />);
});
```

### Component Fixtures

```typescript
import { mockButtonProps, mockFormProps } from '@/tests/fixtures/component.fixture';

test('button component', () => {
  render(<Button {...mockButtonProps} />);
});
```

## Common Test Patterns

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

test('custom hook', () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.doSomething();
  });
  
  expect(result.current.value).toBe('expected');
});
```

### Testing Context Providers

```typescript
import { render } from '@/tests/utils/test-utils';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme="dark">
      {ui}
    </ThemeProvider>
  );
};
```

### Testing with Router

```typescript
import { render } from '@/tests/utils/test-utils';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};
```

### Testing Async Operations

```typescript
import { waitFor } from '@/tests/utils/test-utils';

test('async operation', async () => {
  render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing Form Interactions

```typescript
import userEvent from '@testing-library/user-event';

test('form submission', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);
  
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### Testing Error States

```typescript
test('error handling', async () => {
  mockFetchError('Network error');
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npm run test:debug -- --grep "specific test"
```

### Test UI

```bash
# Open Vitest UI
npm run test:ui
```

### Playwright Debug

```bash
# Run Playwright in debug mode
npm run test:e2e:headed
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// Good
test('should display error message when API call fails', () => {});

// Bad
test('API error', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
test('should increment counter when button is clicked', () => {
  // Arrange
  render(<Counter />);
  const button = screen.getByRole('button');
  
  // Act
  fireEvent.click(button);
  
  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 3. Test User Behavior, Not Implementation

```typescript
// Good - tests what user sees
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Bad - tests implementation details
expect(component.state.isLoggedIn).toBe(true);
```

### 4. Use Data Test IDs Sparingly

```typescript
// Only when necessary for testing
<button data-testid="submit-button">Submit</button>

// Prefer accessible queries
screen.getByRole('button', { name: /submit/i });
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup();
  resetAllMocks();
});
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
- Consult the [Quick Start Guide](./QUICK_START_GUIDE.md) for basic usage

---

*Happy Testing! 🧪*
