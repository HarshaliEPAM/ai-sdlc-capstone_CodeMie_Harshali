# QA Tester Agent

## Role
Write and execute automated tests for backend and frontend code.

## Responsibilities
1. Read generated code
2. Write JUnit tests for backend
3. Write React Testing Library tests for frontend
4. Execute all tests
5. Generate test report
6. Update Jira and Confluence with test results

## Input
- src/ (backend code)
- frontend/ (frontend code)

## Output
- src/test/ (backend tests)
- frontend/src/**/*.test.js (frontend tests)
- Test execution report
- Confluence test documentation page

## Prompt to Use
Use @prompts/generate-tests.md

## Backend Testing (JUnit 5 + Mockito)

### Test Structure
```
src/test/java/com/[domain]/
├── controller/
│   └── [Entity]ControllerTest.java
├── service/
│   └── [Entity]ServiceTest.java
└── repository/
    └── [Entity]RepositoryTest.java
```

### Controller Test Template
```java
@SpringBootTest
@AutoConfigureMockMvc
class ResourceControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ResourceService resourceService;
    
    @Test
    void testGetAll() throws Exception {
        List<ResourceDTO> resources = Arrays.asList(new ResourceDTO());
        when(resourceService.getAll()).thenReturn(resources);
        
        mockMvc.perform(get("/api/resources"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }
    
    @Test
    void testCreate() throws Exception {
        ResourceDTO dto = new ResourceDTO();
        dto.setName("Test");
        
        when(resourceService.create(any())).thenReturn(dto);
        
        mockMvc.perform(post("/api/resources")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Test\"}"))
            .andExpect(status().isCreated());
    }
}
```

### Service Test Template
```java
@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {
    
    @Mock
    private ResourceRepository resourceRepository;
    
    @InjectMocks
    private ResourceServiceImpl resourceService;
    
    @Test
    void testCreate() {
        Resource resource = new Resource();
        resource.setName("Test");
        
        when(resourceRepository.save(any())).thenReturn(resource);
        
        ResourceDTO result = resourceService.create(new ResourceDTO());
        
        assertNotNull(result);
        verify(resourceRepository, times(1)).save(any());
    }
}
```

## Frontend Testing (React Testing Library)

### Test Structure
```
frontend/src/
├── components/
│   ├── ResourceList.test.js
│   ├── ResourceForm.test.js
│   └── ResourceItem.test.js
└── App.test.js
```

### Component Test Template
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResourceList from './ResourceList';
import resourceService from '../services/resourceService';

jest.mock('../services/resourceService');

test('renders resource list', async () => {
  resourceService.getAll.mockResolvedValue({
    data: [{ id: 1, name: 'Test Resource' }]
  });
  
  render(<ResourceList />);
  
  await waitFor(() => {
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
  });
});

test('creates new resource', async () => {
  resourceService.create.mockResolvedValue({
    data: { id: 2, name: 'New Resource' }
  });
  
  render(<ResourceForm />);
  
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'New Resource' }
  });
  
  fireEvent.click(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(resourceService.create).toHaveBeenCalled();
  });
});

test('deletes resource', async () => {
  resourceService.delete.mockResolvedValue({});
  
  render(<ResourceItem id={1} name="Test" />);
  
  fireEvent.click(screen.getByText('Delete'));
  
  await waitFor(() => {
    expect(resourceService.delete).toHaveBeenCalledWith(1);
  });
});
```

## Test Execution

### Backend Tests
```bash
mvn clean test
mvn test -Dtest=[SpecificTestClass]
```

### Frontend Tests
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

## Test Coverage Requirements
- Backend: Minimum 80% code coverage
- Frontend: Minimum 70% code coverage
- All CRUD operations must be tested
- Error handling must be tested

## Test Report Template

```markdown
# Test Execution Report

## Summary
- **Date**: [timestamp]
- **Total Tests**: XX
- **Passed**: XX
- **Failed**: XX
- **Coverage**: XX%

## Backend Tests
- Controller Tests: X/X passed
- Service Tests: X/X passed
- Repository Tests: X/X passed
- Coverage: XX%

## Frontend Tests
- Component Tests: X/X passed
- Integration Tests: X/X passed
- Coverage: XX%

## Failed Tests
[List any failures with details]

## Recommendations
[Any improvements needed]
```

## Jira Integration

```
PUT ${JIRA_BASE_URL}/rest/api/2/issue/[TASK-KEY]/transitions
{
  "transition": {"id": "[done-transition-id]"}
}

POST ${JIRA_BASE_URL}/rest/api/2/issue/[EPIC-KEY]/comment
{
  "body": "Test Results:\n- Total: XX\n- Passed: XX\n- Failed: XX\n- Coverage: XX%"
}
```

## Confluence Integration

Create test documentation page:
```
POST ${CONFLUENCE_BASE_URL}/rest/api/content
{
  "type": "page",
  "title": "[Project] Test Documentation",
  "space": {"key": "${CONFLUENCE_SPACE_KEY}"},
  "body": {
    "storage": {
      "value": "<test report HTML>",
      "representation": "storage"
    }
  }
}
```

## Success Criteria
- ✅ All tests written for critical paths
- ✅ Backend tests execute: `mvn test` exits 0
- ✅ Frontend tests execute: `npm test` exits 0
- ✅ Coverage meets requirements
- ✅ Test report generated
- ✅ Jira updated
- ✅ Confluence test page created

## Knowledge Base References
- docs/testing-guidelines.md
- knowledge-base/common-patterns.md
