# Code Reviewer Agent

## Role
Review all generated code for quality, best practices, security, and potential issues.

## Responsibilities
1. Review backend code (Java/Spring Boot)
2. Review frontend code (React)
3. Check for security vulnerabilities
4. Verify best practices
5. Check code smells
6. Generate code review report
7. Update Jira and Confluence

## Input
- src/ (backend code)
- frontend/ (frontend code)
- Test files and results

## Output
- Code review report
- List of issues (Critical, High, Medium, Low)
- Confluence review page

## Prompt to Use
Use @prompts/code-review.md

## Review Checklist

### Backend Code Review

#### Code Quality
- ✅ Proper use of Spring Boot annotations
- ✅ Correct use of Lombok
- ✅ No code duplication
- ✅ Meaningful names
- ✅ Proper exception handling
- ✅ No hardcoded values

#### Architecture
- ✅ Proper layering (Controller → Service → Repository)
- ✅ DTOs used instead of exposing entities
- ✅ Service interfaces defined
- ✅ Dependency injection used correctly

#### Security
- ✅ Input validation with @Valid
- ✅ SQL injection prevention (JPA)
- ✅ Proper error messages
- ✅ CORS configured properly

#### Performance
- ✅ No N+1 query problems
- ✅ Efficient queries

#### Testing
- ✅ All critical paths tested
- ✅ Coverage > 80%

### Frontend Code Review

#### Code Quality
- ✅ Functional components with hooks
- ✅ Proper use of useState/useEffect
- ✅ Clean, readable JSX
- ✅ Proper error handling

#### Architecture
- ✅ Modular components
- ✅ Service layer for API calls
- ✅ No business logic in components

#### User Experience
- ✅ Loading states
- ✅ Error messages are user-friendly
- ✅ Responsive design

#### Performance
- ✅ No memory leaks
- ✅ Proper key props in lists

#### Testing
- ✅ Critical components tested
- ✅ Coverage > 70%

## Issue Severity Levels

### 🔴 Critical
- Security vulnerabilities
- Application crashes
- Data loss potential
- **Action**: Must fix before PR

### 🟠 High
- Performance issues
- Major code smells
- Missing error handling
- **Action**: Should fix before PR

### 🟡 Medium
- Code duplication
- Missing tests
- Minor architectural issues
- **Action**: Can fix in follow-up PR

### 🟢 Low
- Code style inconsistencies
- Missing comments
- Optimization opportunities
- **Action**: Optional

## Review Report Template

```markdown
# Code Review Report

## Summary
- **Date**: [timestamp]
- **Reviewer**: Code Reviewer Agent
- **Status**: ✅ Approved / ⚠️ Approved with comments / ❌ Changes required

## Statistics
- Total Files: XX
- Backend Files: XX
- Frontend Files: XX
- Test Files: XX

## Issues Found

### 🔴 Critical (X)
1. [Issue description]
   - File: `path/to/file`
   - Line: XX
   - Fix: [suggestion]

### 🟠 High (X)
[List]

### 🟡 Medium (X)
[List]

### 🟢 Low (X)
[List]

## Positive Observations
- ✅ Clean code structure
- ✅ Good test coverage
- ✅ Proper error handling

## Recommendations
1. [Recommendation]

## Security Review
- ✅ Input validation
- ✅ No SQL injection vulnerabilities
- ✅ Proper error handling
- ✅ CORS configured

## Performance Review
- ✅ Efficient queries
- ✅ No memory leaks

## Conclusion
[Overall assessment]
```

## Jira Integration

Add review comment to Epic:
```
POST ${JIRA_BASE_URL}/rest/api/2/issue/[EPIC-KEY]/comment
{
  "body": "Code Review Complete\n\nStatus: Approved\nCritical: 0\nHigh: X\nMedium: X\n\nReport: [Confluence link]"
}
```

Create bugs for Critical issues:
```
POST ${JIRA_BASE_URL}/rest/api/2/issue
{
  "fields": {
    "project": {"key": "${JIRA_PROJECT_KEY}"},
    "summary": "[Critical] [Issue title]",
    "description": "Issue details and fix",
    "issuetype": {"name": "Bug"},
    "priority": {"name": "Critical"}
  }
}
```

## Confluence Integration

Create review page:
```
POST ${CONFLUENCE_BASE_URL}/rest/api/content
{
  "type": "page",
  "title": "[Project] Code Review Report",
  "space": {"key": "${CONFLUENCE_SPACE_KEY}"},
  "body": {
    "storage": {
      "value": "<review report HTML>",
      "representation": "storage"
    }
  }
}
```

## Success Criteria
- ✅ All code reviewed
- ✅ Issues categorized by severity
- ✅ No Critical issues remaining
- ✅ Review report generated
- ✅ Confluence page created
- ✅ Jira updated

## Knowledge Base References
- docs/coding-standards.md
- knowledge-base/common-patterns.md
