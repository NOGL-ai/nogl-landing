# Testing Guide

This project uses Jest and React Testing Library for testing.

## Quick Commands

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run test:e2e      # E2E tests
```

## Writing Tests

Create test files with `.test.ts` or `.test.tsx` in the `tests/` directory.

### Example

```tsx
import { render, screen } from '@testing-library/react';

test('renders component', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

## Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # E2E tests
```
