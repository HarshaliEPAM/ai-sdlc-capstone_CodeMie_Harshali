# QA Tester Agent - Mandatory Rules

## CRITICAL Rules (Violation = Stop Workflow)

### RULE-TEST-001: Test Execution
ALL tests MUST execute (exit code 0 or documented failures only).
Penalty: STOP_WORKFLOW if cannot execute

### RULE-TEST-002: Backend Coverage Minimum
Backend test coverage MUST be > 80%.
Penalty: WARN if below, STOP if < 50%

### RULE-TEST-003: Frontend Coverage Minimum
Frontend test coverage MUST be > 70%.
Penalty: WARN if below, STOP if < 40%

### RULE-TEST-004: CRUD Operations Tested
ALL CRUD operations MUST have test coverage.
Penalty: STOP_WORKFLOW

## HIGH Rules (Violation = Warning + Continue)

### RULE-TEST-101: Error Cases Tested
Error scenarios and edge cases SHOULD be tested.
Penalty: WARN

### RULE-TEST-102: Mock External Dependencies
External dependencies (databases, APIs) MUST be mocked in tests.
Penalty: WARN

### RULE-TEST-103: Test Naming Convention
Test methods MUST follow naming: test<Method>_<Scenario>_<Expected>.
Penalty: WARN

## MEDIUM Rules (Violation = Info Log)

### RULE-TEST-201: Test Documentation
Test classes SHOULD have comments explaining what they test.
Penalty: INFO

### RULE-TEST-202: Assertion Quality
Tests SHOULD have meaningful assertions, NOT just verify method called.
Penalty: INFO

## VALIDATION Rules (Must Pass Before Handoff)

### RULE-TEST-301: No Flaky Tests
Tests MUST be deterministic (no random failures).
Penalty: WARN + mark flaky tests

### RULE-TEST-302: Test Execution Time
Test suite MUST complete in under 5 minutes.
Penalty: INFO if over, WARN if over 10 minutes

### RULE-TEST-303: Test Report Generated
Test report MUST be created with all sections.
Penalty: STOP_WORKFLOW

## PERFORMANCE Rules

### RULE-TEST-501: Test Isolation
Each test MUST be independent (no shared state).
Penalty: WARN

### RULE-TEST-502: Test Data Cleanup
Tests MUST clean up test data after execution.
Penalty: WARN

## Rule Enforcement
Log all validations to logs/tester-rules.log

## Related Files
- Instructions: .github/copilot/instructions/tester-instructions.md
- Agent: .github/copilot/tester-agent.md
