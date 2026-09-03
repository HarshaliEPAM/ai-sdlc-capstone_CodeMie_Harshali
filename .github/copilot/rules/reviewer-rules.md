# Code Reviewer Agent - Mandatory Rules

## CRITICAL Rules (Violation = Create Bug, Log, Continue)

### RULE-REV-001: No Security Vulnerabilities
Code MUST NOT contain SQL injection, XSS, or exposed credentials.
Penalty: CRITICAL_BUG + LOG

### RULE-REV-002: No Hardcoded Credentials
NO passwords, tokens, or sensitive data in code.
Penalty: CRITICAL_BUG + LOG

### RULE-REV-003: Input Validation Required
ALL user inputs MUST be validated.
Penalty: CRITICAL_BUG + LOG

### RULE-REV-004: Error Handling Present
ALL critical paths MUST have proper error handling.
Penalty: CRITICAL_BUG + LOG

## HIGH Rules (Violation = Warning + Bug)

### RULE-REV-101: Naming Conventions
Code MUST follow naming conventions (PascalCase classes, camelCase methods).
Penalty: WARN + BUG

### RULE-REV-102: No Code Duplication
Significant code duplication SHOULD be refactored.
Penalty: WARN + BUG

### RULE-REV-103: Proper Error Handling
Exceptions MUST be caught and handled appropriately.
Penalty: WARN + BUG

### RULE-REV-104: Test Coverage Verified
Test coverage MUST meet minimum thresholds.
Penalty: WARN if below threshold

## MEDIUM Rules (Violation = Info Log)

### RULE-REV-201: Code Comments
Complex logic SHOULD have explanatory comments.
Penalty: INFO

### RULE-REV-202: Method Length
Methods SHOULD be < 50 lines.
Penalty: INFO if over 100 lines

### RULE-REV-203: Class Responsibility
Classes SHOULD follow Single Responsibility Principle.
Penalty: INFO

## VALIDATION Rules (Must Pass Before Handoff)

### RULE-REV-301: All Files Reviewed
ALL code files MUST be reviewed.
Penalty: STOP_WORKFLOW if not complete

### RULE-REV-302: Report Generated
Review report MUST be created.
Penalty: STOP_WORKFLOW

### RULE-REV-303: Critical Issues Documented
ALL critical issues MUST be documented with fix suggestions.
Penalty: STOP_WORKFLOW

## SECURITY Rules

### RULE-REV-401: SQL Injection Check
MUST verify no raw SQL with string concatenation.
Penalty: CRITICAL_BUG

### RULE-REV-402: XSS Prevention
MUST verify output encoding and input sanitization.
Penalty: CRITICAL_BUG

### RULE-REV-403: Authentication/Authorization
If applicable, MUST verify proper authentication implementation.
Penalty: WARN

## PERFORMANCE Rules

### RULE-REV-501: Database Query Efficiency
MUST check for N+1 queries and missing indexes.
Penalty: WARN

### RULE-REV-502: Memory Leak Detection
MUST check for potential memory leaks (unclosed resources, circular references).
Penalty: WARN

## Rule Enforcement
- CRITICAL: Create Jira bug, log, continue
- HIGH: Warn, create bug
- MEDIUM: Info log
- VALIDATION: Must complete
- Log all to logs/reviewer-rules.log

## Related Files
- Instructions: .github/copilot/instructions/reviewer-instructions.md
- Agent: .github/copilot/reviewer-agent.md
