# Testing Guide

This directory contains comprehensive tests for the Ultimate Product Table backend following industry best practices.

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── products.e2e.test.ts
├── performance/            # Performance tests
│   └── products.performance.test.ts
├── unit/                   # Unit tests
├── integration/            # Integration tests
└── README.md              # This file

src/
├── __mocks__/             # Mock files
│   └── prisma.ts
├── middlewares/__tests__/ # Middleware tests
├── lib/__tests__/         # Library tests
└── app/api/__tests__/     # API route tests
```

## Test Types

### 1. Unit Tests
- **Purpose**: Test individual functions and components in isolation
- **Location**: `src/**/__tests__/`
- **Coverage**: Services, utilities, middleware, validation schemas
- **Tools**: Jest, React Testing Library

### 2. Integration Tests
- **Purpose**: Test API endpoints and database interactions
- **Location**: `src/app/api/__tests__/`
- **Coverage**: API routes, database queries, middleware chains
- **Tools**: Jest, Supertest, Prisma Mock

### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Location**: `tests/e2e/`
- **Coverage**: Full application flows, user interactions
- **Tools**: Playwright

### 4. Performance Tests
- **Purpose**: Test application performance under load
- **Location**: `tests/performance/`
- **Coverage**: Load times, memory usage, concurrent requests
- **Tools**: Playwright, Custom performance metrics

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Setup test database
npm run test:db:setup

# Install Playwright browsers
npx playwright install
```

### Test Commands

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run performance tests
npm run test:performance

# Run tests in CI mode
npm run test:ci
```

## Test Database

### Setup
```bash
# Create test database
npm run test:db:setup

# Reset test database
npm run test:db:reset
```

### Environment Variables
```env
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/test_db
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
```

## Test Coverage

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-final.json`
- **LCOV**: `coverage/lcov.info`

## Mocking Strategy

### Prisma Mock
- **File**: `src/__mocks__/prisma.ts`
- **Purpose**: Mock database operations
- **Usage**: Automatic mocking via Jest

### API Mocking
- **Tool**: Playwright route interception
- **Purpose**: Mock external API calls
- **Usage**: Route-level mocking in E2E tests

## Test Data

### Test Database Utilities
- **File**: `src/lib/testDb.ts`
- **Purpose**: Database setup, seeding, cleanup
- **Usage**: Before/after test hooks

### Test Utilities
- **File**: `src/lib/testUtils.ts`
- **Purpose**: Helper functions for test data creation
- **Usage**: Consistent test data across tests

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Data
- Use factories for test data creation
- Clean up test data after each test
- Use realistic test data

### 3. Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify error conditions

### 4. Performance
- Set reasonable timeouts
- Monitor memory usage
- Test with realistic data volumes

## CI/CD Integration

### GitHub Actions
- **File**: `.github/workflows/test.yml`
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**: Test, Performance, Security

### Test Stages
1. **Linting**: Code quality checks
2. **Type Checking**: TypeScript validation
3. **Unit Tests**: Fast feedback
4. **Integration Tests**: API validation
5. **E2E Tests**: Full workflow validation
6. **Performance Tests**: Load testing
7. **Security Tests**: Vulnerability scanning

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
npm test -- products.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create product"

# Debug mode
npm test -- --detectOpenHandles --forceExit
```

### E2E Tests
```bash
# Run in headed mode
npm run test:e2e:headed

# Run specific test
npx playwright test products.e2e.test.ts

# Debug mode
npx playwright test --debug
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check TEST_DATABASE_URL
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Mock Issues**
   - Check mock file paths
   - Verify mock implementations
   - Clear Jest cache

3. **Timeout Errors**
   - Increase test timeouts
   - Check for hanging promises
   - Verify cleanup functions

4. **Coverage Issues**
   - Check coverage thresholds
   - Verify test file patterns
   - Review uncovered code

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts`
3. Add to relevant test suite
4. Update coverage if needed

### Test Review Checklist
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests are isolated
- [ ] Tests clean up after themselves
- [ ] Tests have descriptive names
- [ ] Tests follow AAA pattern
- [ ] Coverage meets thresholds