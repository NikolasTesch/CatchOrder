# Test Organization

This directory contains all automated tests for the CatchOrder application, organized by frontend/backend and integration/unit.

## Directory Structure

```
tests/
├── backend/
│   ├── integration/          # Backend API integration tests
│   │   ├── auth.test.ts
│   │   ├── category.test.ts
│   │   ├── orders.test.ts
│   │   ├── products.test.ts
│   │   ├── tableRoutes.test.ts
│   │   └── user.test.ts
│   └── unit/                 # Backend unit tests
│       ├── controllers/
│       │   └── productControllers.test.ts
│       └── models/
│           ├── productModel.test.ts
│           └── tableModel.test.ts
├── frontend/
│   ├── integration/          # Frontend integration tests (empty)
│   └── unit/                 # Frontend unit tests
│       └── waiterMain.test.ts
└── setup/
    └── jest.setup.ts         # Jest configuration
```

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test File

```bash
npm test -- <test-name>.test.ts
```

### Frontend Tests Only

```bash
npm test -- tests/frontend
```

### Backend Tests Only

```bash
npm test -- tests/backend
```

### Integration Tests Only

```bash
npm test -- tests/backend/integration
npm test -- tests/frontend/integration
```

### Unit Tests Only

```bash
npm test -- tests/backend/unit
npm test -- tests/frontend/unit
```

## Test Coverage

### Frontend

- **Unit Tests:** 1 file, 13 tests
  - `waiterMain.test.ts`: Date formatting, currency conversion, tips calculation, table rendering

### Backend

- **Integration Tests:** 6 files
  - Authentication, Categories, Orders, Products, Tables, Users
- **Unit Tests:** 3 files
  - Product controllers, Product model, Table model

## Adding New Tests

### Frontend Unit Test

Create test file in `tests/frontend/unit/`:

```typescript
// tests/frontend/unit/myComponent.test.ts
describe('My Component', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Backend Integration Test

Create test file in `tests/backend/integration/`:

```typescript
// tests/backend/integration/myFeature.test.ts
import request from 'supertest';
import { app } from '../../../src/backend/app';

describe('My Feature API', () => {
  it('should return 200', async () => {
    await request(app).get('/api/my-endpoint').expect(200);
  });
});
```

### Backend Unit Test

Create test file in `tests/backend/unit/`:

```typescript
// tests/backend/unit/models/myModel.test.ts
import { MyModel } from '../../../../src/backend/models/myModel';

describe('MyModel', () => {
  it('should create instance', () => {
    const instance = new MyModel();
    expect(instance).toBeDefined();
  });
});
```

## Notes

- All tests use Jest as the test runner
- TypeScript tests are transpiled using ts-jest
- Backend tests require database migrations to run
- Import paths use relative paths from test file location
