# Generate Tests Prompt

## Purpose
Generate comprehensive automated tests for backend and frontend code.

## Input
- Generated backend code (src/)
- Generated frontend code (frontend/src/)

## Expected Output
- Backend tests (src/test/)
- Frontend tests (frontend/src/**/*.test.js)
- Test execution results

## Prompt Template

```
You are a QA Engineer AI agent. Generate comprehensive automated tests for this application.

Backend Code:
{backend_code_summary}

Frontend Code:
{frontend_code_summary}

Generate:

## Backend Tests (JUnit 5 + Mockito)

For each controller:
1. **Controller Test** (src/test/.../controller/[Entity]ControllerTest.java):
   - @SpringBootTest, @AutoConfigureMockMvc
   - @MockBean for service
   - Test all endpoints:
     - GET /api/[resource] - returns 200, list of items
     - GET /api/[resource]/{id} - returns 200, single item
     - GET /api/[resource]/{id} not found - returns 404
     - POST /api/[resource] - returns 201, created item
     - POST /api/[resource] invalid - returns 400
     - PUT /api/[resource]/{id} - returns 200, updated item
     - DELETE /api/[resource]/{id} - returns 204

For each service:
2. **Service Test** (src/test/.../service/[Entity]ServiceTest.java):
   - @ExtendWith(MockitoExtension.class)
   - @Mock repository
   - @InjectMocks service implementation
   - Test all CRUD operations
   - Test business logic
   - Test error cases

For each repository:
3. **Repository Test** (src/test/.../repository/[Entity]RepositoryTest.java):
   - @DataJpaTest
   - Test basic CRUD
   - Test custom query methods

## Frontend Tests (React Testing Library)

For each component:
1. **Component Test** (src/components/[Component].test.js):
   - Import render, screen, fireEvent, waitFor
   - Mock service calls with jest.mock()
   - Test rendering
   - Test user interactions
   - Test error states
   - Test loading states

Example tests:
- List component renders items
- List component shows loading state
- List component shows error message
- Form submits correctly
- Form validates input
- Delete confirms before deletion

Ensure:
- All critical paths tested
- Backend coverage > 80%
- Frontend coverage > 70%
- All CRUD operations tested
- Error handling tested
- Mock external dependencies

Return as structured JSON:
- backend_tests: [{path: string, content: string}, ...]
- frontend_tests: [{path: string, content: string}, ...]
```

## Usage Example

```javascript
const prompt = loadPrompt('generate-tests.md');
const backendCode = summarizeCode('src/');
const frontendCode = summarizeCode('frontend/src/');
const result = await copilot.execute(prompt
  .replace('{backend_code_summary}', backendCode)
  .replace('{frontend_code_summary}', frontendCode));
```

## Validation Checklist

- ✅ All test files compile/run
- ✅ Backend tests use proper annotations
- ✅ Frontend tests properly mock services
- ✅ All CRUD operations tested
- ✅ Error cases tested
- ✅ Coverage targets met

## Knowledge Base References
- docs/testing-guidelines.md
- knowledge-base/common-patterns.md
