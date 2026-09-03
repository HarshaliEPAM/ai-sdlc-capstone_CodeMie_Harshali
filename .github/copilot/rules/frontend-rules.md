# Frontend Developer Agent - Mandatory Rules

## CRITICAL Rules (Violation = Stop Workflow)

### RULE-FE-001: npm Install Success
npm install MUST complete successfully (exit code 0).
Penalty: STOP_WORKFLOW

### RULE-FE-002: No Syntax Errors
ALL JavaScript files MUST be syntactically valid.
Penalty: STOP_WORKFLOW

### RULE-FE-003: Service Layer Required
ALL API calls MUST go through service layer, NOT directly in components.
Penalty: STOP_WORKFLOW

### RULE-FE-004: package.json Validation
package.json MUST be valid JSON with required dependencies.
Penalty: STOP_WORKFLOW

## HIGH Rules (Violation = Warning + Continue)

### RULE-FE-101: Functional Components Only
MUST use functional components with Hooks, NOT class components.
Penalty: WARN + regenerate

### RULE-FE-102: Error Handling
Components MUST implement error handling with useState for errors.
Penalty: WARN

### RULE-FE-103: Loading States
Components fetching data MUST implement loading states.
Penalty: WARN

### RULE-FE-104: Axios Usage
MUST use axios for HTTP requests, NOT fetch API.
Penalty: WARN

## MEDIUM Rules (Violation = Info Log)

### RULE-FE-201: User-Friendly Errors
Error messages SHOULD be user-friendly, NOT technical.
Penalty: INFO

### RULE-FE-202: Component Naming
Component files SHOULD use PascalCase naming.
Penalty: INFO

### RULE-FE-203: Props Validation
Components SHOULD validate props with PropTypes or TypeScript.
Penalty: INFO

## VALIDATION Rules (Must Pass Before Handoff)

### RULE-FE-301: No console.log
NO console.log() statements in production code.
Penalty: WARN + auto-remove

### RULE-FE-302: Key Props in Lists
ALL mapped lists MUST use proper key props.
Penalty: STOP_WORKFLOW

### RULE-FE-303: npm start Works
Application MUST start successfully (npm start).
Penalty: STOP_WORKFLOW

## SECURITY Rules

### RULE-FE-401: Input Sanitization
User input MUST be sanitized before displaying or submitting.
Penalty: WARN

### RULE-FE-402: XSS Prevention
NO dangerouslySetInnerHTML without sanitization.
Penalty: CRITICAL_ERROR

## PERFORMANCE Rules

### RULE-FE-501: useEffect Cleanup
useEffect hooks with subscriptions MUST include cleanup functions.
Penalty: WARN

### RULE-FE-502: Unnecessary Re-renders
MUST avoid unnecessary re-renders (use useMemo, useCallback where appropriate).
Penalty: INFO

## Rule Enforcement
Log all validations to logs/frontend-rules.log

## Related Files
- Instructions: .github/copilot/instructions/frontend-instructions.md
- Agent: .github/copilot/frontend-agent.md
