# Testing Strategy for Microservices Architecture

## Overview

This document outlines the comprehensive testing strategy for the Weather Forecast microservices system, covering unit tests, integration tests, end-to-end tests, and architecture compliance tests.

## Testing Pyramid

```
    ┌─────────────┐
    │   E2E Tests │ ← Few, slow, expensive
    └─────────────┘
    ┌─────────────┐
    │Integration  │ ← Some, medium speed
    │   Tests     │
    └─────────────┘
    ┌─────────────┐
    │  Unit Tests │ ← Many, fast, cheap
    └─────────────┘
```

## Test Types

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Coverage**: 
- Service business logic
- Controller request/response handling
- Utility functions
- Data mappers and validators

**Tools**: Jest, NestJS testing utilities

**Location**: `apps/*/src/**/*.spec.ts`

**Example**:
```typescript
// weather.service.spec.ts
describe('WeatherService', () => {
  it('should fetch weather data from primary provider', async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests

**Purpose**: Test service-to-service communication and external integrations

**Coverage**:
- gRPC communication between services
- Database operations
- External API calls (Weather APIs)
- Email service integration
- Redis caching

**Tools**: Jest, Testcontainers, gRPC testing utilities

**Location**: `apps/*/test/integration/`

**Example**:
```typescript
// subscription.service.int-spec.ts
describe('SubscriptionService Integration', () => {
  it('should create subscription and send confirmation email', async () => {
    // Integration test implementation
  });
});
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows across all services

**Coverage**:
- Complete subscription workflow
- Weather data retrieval
- Email delivery process
- API Gateway routing

**Tools**: Playwright, Docker Compose

**Location**: `test/e2e/`

**Example**:
```typescript
// subscription.spec.ts
test('complete subscription workflow', async ({ page }) => {
  // E2E test implementation
});
```

### 4. Architecture Tests

**Purpose**: Ensure compliance with architectural rules and patterns

**Coverage**:
- Dependency direction compliance
- Service boundary validation
- gRPC interface consistency
- Code organization rules

**Tools**: Jest-Arch, custom architecture rules

**Location**: `test/architecture/`

**Example**:
```typescript
// architecture.arch-spec.ts
describe('Architecture Rules', () => {
  it('should not have circular dependencies', () => {
    // Architecture test implementation
  });
});
```

## Service-Specific Testing

### API Gateway Testing

**Focus Areas**:
- Request routing to appropriate services
- Authentication and authorization
- Rate limiting
- Error handling and logging
- gRPC client communication

**Test Structure**:
```
apps/api-gateway/
├── src/
│   ├── subscription/
│   │   ├── subscription.controller.spec.ts
│   │   └── subscription.service.spec.ts
│   └── weather/
│       ├── weather.controller.spec.ts
│       └── weather.service.spec.ts
└── test/
    └── integration/
        └── gateway.integration.spec.ts
```

### Weather Service Testing

**Focus Areas**:
- Weather data fetching from multiple providers
- Caching behavior
- Provider fallback logic
- Data formatting and validation
- Error handling for external APIs

**Test Structure**:
```
apps/weather/
├── src/
│   └── modules/
│       └── weather/
│           ├── weather.controller.spec.ts
│           ├── weather.service.spec.ts
│           └── providers/
│               ├── open-meteo-provider.spec.ts
│               └── weather-api-provider.spec.ts
└── test/
    └── integration/
        └── weather.integration.spec.ts
```

### Subscription Service Testing

**Focus Areas**:
- Database operations and migrations
- Email template rendering
- Scheduled job processing
- Subscription lifecycle management
- Email delivery tracking

**Test Structure**:
```
apps/subscription/
├── src/
│   └── modules/
│       ├── subscription/
│       │   ├── subscription.controller.spec.ts
│       │   ├── subscription.service.spec.ts
│       │   └── subscription.repository.spec.ts
│       ├── email/
│       │   └── email.service.spec.ts
│       └── scheduler/
│           └── scheduler.service.spec.ts
└── test/
    └── integration/
        └── subscription.integration.spec.ts
```

## Test Environment Setup

### Docker Compose for Testing

```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: weather_test

  redis-test:
    image: redis:7

  api-gateway-test:
    build: .
    environment:
      NODE_ENV: test
      WEATHER_SERVICE_URL: weather-service-test:3001
      SUBSCRIPTION_SERVICE_URL: subscription-service-test:3002

  weather-service-test:
    build: .
    environment:
      NODE_ENV: test
      REDIS_HOST: redis-test

  subscription-service-test:
    build: .
    environment:
      NODE_ENV: test
      DATABASE_HOST: postgres-test
      REDIS_HOST: redis-test
```

### Test Data Management

**Fixtures**: Predefined test data for consistent testing
**Factories**: Generate test data dynamically
**Cleanup**: Automatic cleanup after each test

```typescript
// test/fixtures/weather.fixtures.ts
export const weatherFixtures = {
  kyivWeather: {
    city: 'Kyiv',
    temperature: 20,
    humidity: 65,
    description: 'Partly cloudy'
  }
};
```

## How to Run Tests

### Quick Start

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test:all
```

### Test Scripts

```bash
# Unit tests
pnpm test                    # All unit tests
pnpm test:gateway           # API Gateway tests
pnpm test:weather           # Weather Service tests
pnpm test:subscription      # Subscription Service tests
pnpm test:cov               # With coverage
pnpm test:watch             # Watch mode
pnpm test:debug             # Debug mode

# Integration tests
pnpm db:restart:test        # Start test infrastructure
pnpm test:integration       # Run integration tests
pnpm test:int              # Reset DB + run integration tests
pnpm test:int:watch        # Watch mode

# E2E tests
pnpm test:e2e              # Run E2E tests
npx playwright test --ui   # With UI
npx playwright test --headed # Headed mode

# Architecture tests
pnpm test:arch             # Run architecture tests
pnpm test:arch:watch       # Watch mode
```

### Environment Setup

Create `.env.test.local`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres-test
DATABASE_PASSWORD=postgres-test
DATABASE_NAME=test-db
REDIS_HOST=localhost
REDIS_PORT=6380
WEATHER_SERVICE_URL=localhost:3001
SUBSCRIPTION_SERVICE_URL=localhost:3002
```

### Database Management

```bash
pnpm db:drop:test          # Drop test database
pnpm db:reset:test         # Reset test database
pnpm migration:run:test    # Run migrations
```

## Performance Testing

### Load Testing

**Tools**: Artillery, k6
**Scenarios**:
- High concurrent weather requests
- Subscription creation under load
- Email delivery performance
- API Gateway routing performance

**Metrics**:
- Response times (p50, p95, p99)
- Throughput (requests per second)
- Error rates
- Resource utilization

### Stress Testing

**Purpose**: Identify system breaking points
**Scenarios**:
- Database connection exhaustion
- Redis memory limits
- External API rate limits
- Email service failures

## Security Testing

### Authentication & Authorization

- JWT token validation
- Role-based access control
- API key management
- Rate limiting effectiveness

### Data Security

- SQL injection prevention
- XSS protection
- Input validation
- Sensitive data handling

## Monitoring and Observability

### Test Metrics

- Test execution time
- Test coverage percentage
- Flaky test detection
- Performance regression detection

### Test Reporting

- HTML coverage reports
- JUnit XML reports
- Custom test dashboards
- Slack/email notifications

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e
      - run: pnpm test:arch
```

### Pre-commit Hooks

- Linting and formatting
- Unit test execution
- Architecture compliance checks
- Security vulnerability scanning

## Best Practices

### Test Organization

1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: Test names that explain the scenario
3. **Single Responsibility**: Each test focuses on one behavior
4. **Independent Tests**: Tests don't depend on each other

### Test Data

1. **Isolation**: Each test has its own data
2. **Realistic Data**: Use realistic but anonymized data
3. **Minimal Data**: Only include necessary test data
4. **Consistent Data**: Use fixtures for consistent test data

### Mocking Strategy

1. **External Dependencies**: Mock external APIs and services
2. **Database**: Use test database or in-memory database
3. **Time**: Mock time-dependent operations
4. **Randomness**: Control random behavior for deterministic tests

### Error Testing

1. **Happy Path**: Test successful scenarios
2. **Error Scenarios**: Test error handling and edge cases
3. **Boundary Conditions**: Test limits and boundaries
4. **Recovery**: Test system recovery from failures

## Future Enhancements

### Planned Improvements

1. **Contract Testing**: Implement Pact for service contract validation
2. **Chaos Engineering**: Add chaos testing for resilience validation
3. **Visual Regression Testing**: Add visual testing for UI components
4. **API Contract Testing**: Validate API contracts between services
5. **Performance Regression Testing**: Automated performance testing

### Tools Evaluation

1. **Testcontainers**: For better integration test isolation
2. **WireMock**: For external API mocking
3. **Cypress**: For component testing
4. **Playwright**: Enhanced E2E testing capabilities

