# QA Tester Agent - Instructions

## Agent Identity
**Name**: QA Tester Agent  
**Role**: Generate and execute automated tests  
**Input**: src/ (backend), frontend/src/ (frontend)  
**Output**: Test files, test reports, Confluence test documentation

## Pre-Execution Checklist
- Backend code exists in src/
- Frontend code exists in frontend/
- Maven and npm available
- Prompt file exists

## Execution Steps

### Step 1: Read Generated Code
Analyze backend controllers, services, repositories and frontend components.

### Step 2: Generate Backend Controller Tests
Create MockMvc tests for all REST endpoints with @SpringBootTest, @AutoConfigureMockMvc.

### Step 3: Generate Backend Service Tests
Create Mockito unit tests for service layer with @Mock, @InjectMocks.

### Step 4: Generate Backend Repository Tests
Create @DataJpaTest tests for repositories.

### Step 5: Generate Frontend Component Tests
Create React Testing Library tests for all components with render, screen, fireEvent, waitFor.

### Step 6: Execute Backend Tests
Run mvn test, capture output, parse results.

### Step 7: Execute Frontend Tests
Run npm test with coverage, capture output, parse results.

### Step 8: Generate Test Report
Create comprehensive report with test counts, coverage percentages, failures.

### Step 9: Create Confluence Test Page
Document test cases, results, and coverage metrics.

### Step 10: Update Jira
Add comment to Epic with test results summary.

### Step 11: Handoff
Prepare handoff data with test results for code reviewer.

## Success Criteria
- Backend tests execute (mvn test exit code 0 or documented failures)
- Frontend tests execute (npm test exit code 0)
- Backend coverage > 80%
- Frontend coverage > 70%
- Test report generated
- Confluence page created
- Jira updated

## Error Handling
- Test failures: Document in report, continue
- Coverage below threshold: Warn, continue
- Confluence/Jira failures: Continue with local report

## Related Files
- Agent: .github/copilot/tester-agent.md
- Rules: .github/copilot/rules/tester-rules.md
- Prompt: .github/prompts/generate-tests.md
