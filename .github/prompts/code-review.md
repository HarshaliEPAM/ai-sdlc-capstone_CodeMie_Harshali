# Code Review Prompt

## Purpose
Review all generated code for quality, security, and best practices.

## Input
- All generated code (src/, frontend/)
- Test results

## Expected Output
- Code review report
- List of issues by severity
- Recommendations

## Prompt Template

```
You are a Code Reviewer AI agent. Perform a comprehensive code review of this application.

Backend Code:
{backend_code}

Frontend Code:
{frontend_code}

Test Results:
{test_results}

Review Checklist:

## Backend Review

### Code Quality
- Proper Spring Boot annotations
- Correct Lombok usage
- No code duplication
- Meaningful variable/method names
- Proper exception handling
- No hardcoded values

### Architecture
- Layering (Controller → Service → Repository)
- DTOs used (not entities in controllers)
- Service interfaces defined
- Dependency injection correct

### Security
- Input validation (@Valid)
- SQL injection prevention
- Proper error messages (no sensitive data)
- CORS configured

### Performance
- No N+1 query issues
- Efficient queries
- Proper indexing

### Testing
- All critical paths tested
- Coverage > 80%

## Frontend Review

### Code Quality
- Functional components with Hooks
- Proper useState/useEffect usage
- Clean JSX
- Proper error handling

### Architecture
- Modular components
- Service layer for API calls
- No business logic in components

### User Experience
- Loading states
- User-friendly error messages
- Responsive design

### Performance
- No memory leaks (useEffect cleanup)
- Proper key props in lists

### Testing
- Critical components tested
- Coverage > 70%

## Issue Classification

For each issue found:
- **Severity**: Critical, High, Medium, Low
- **File**: path/to/file
- **Line**: line number
- **Description**: what's wrong
- **Fix**: suggested fix
- **Category**: Security, Performance, Code Quality, Best Practices

Generate:

1. **Review Report**:
   - Summary statistics
   - Issues by severity
   - Positive observations
   - Recommendations
   - Security review
   - Performance review
   - Conclusion

2. **Issue List** (structured):
   - Critical issues (must fix)
   - High issues (should fix)
   - Medium issues (can fix later)
   - Low issues (optional)

3. **Jira Bugs** (for Critical issues):
   - JSON payloads for bug creation

4. **Confluence Page Content**:
   - HTML version of report

Ensure:
- All issues have clear descriptions
- All fixes are actionable
- No false positives
- Prioritization is accurate

Return as structured JSON:
- summary: {total_files, issues_by_severity}
- issues: [{severity, file, line, description, fix, category}, ...]
- jira_bugs: [{...}, ...]
- confluence_html: string
- overall_status: "Approved" | "Approved with comments" | "Changes required"
```

## Usage Example

```javascript
const prompt = loadPrompt('code-review.md');
const backend = readAllFiles('src/');
const frontend = readAllFiles('frontend/src/');
const tests = readTestResults();
const result = await copilot.execute(prompt
  .replace('{backend_code}', backend)
  .replace('{frontend_code}', frontend)
  .replace('{test_results}', tests));
```

## Validation Checklist

- ✅ All code files reviewed
- ✅ Issues properly categorized
- ✅ Severity levels accurate
- ✅ Fixes are actionable
- ✅ No Critical issues remaining (or documented)

## Knowledge Base References
- docs/coding-standards.md
- knowledge-base/common-patterns.md
- knowledge-base/known-issues.md
