# Testing Setup

This project uses Jest and React Testing Library for testing.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

Create test files with `.test.ts` or `.test.tsx` extension in the `tests/` directory.

### Example Test

```tsx
import { render, screen } from '@testing-library/react';

test('renders component', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

## Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests (Playwright)
```
