# Framework-Wide Rules - Apply to ALL Agents

## Global Naming Conventions

### RULE-FW-001: File Naming
- Java files: PascalCase (TaskController.java)
- JavaScript files: PascalCase for components, camelCase for utilities
- Markdown files: kebab-case (user-story.txt, architecture.md)
- Config files: lowercase with extensions (.env, pom.xml)

### RULE-FW-002: Git Branch Naming
- Feature branches: feature/agentic-sdlc-[timestamp]
- Bug fix branches: bugfix/[issue-key]-[description]
- Never commit directly to main

### RULE-FW-003: Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```
Types: feat, fix, docs, style, refactor, test, chore
Example: `feat(backend): Add task CRUD endpoints`

---

## Global Environment Variables

### RULE-FW-101: Required Variables
ALL agents MUST verify these exist:
- JIRA_BASE_URL
- JIRA_API_TOKEN
- JIRA_PROJECT_KEY
- JIRA_USER_EMAIL
- CONFLUENCE_BASE_URL
- CONFLUENCE_SPACE_KEY
- CONFLUENCE_API_TOKEN
- GITHUB_TOKEN
- GITHUB_REPO
- GITHUB_OWNER

### RULE-FW-102: Variable Naming
- All caps with underscores: JIRA_API_TOKEN
- Descriptive, not cryptic: USE_DATABASE_URL not DB_U
- No spaces or special characters

---

## Global Logging Standards

### RULE-FW-201: Log Format
```
[TIMESTAMP] [AGENT] [LEVEL] Message
```
Example: `[2024-01-15T10:30:45Z] [REQUIREMENTS] [INFO] Reading user-story.txt`

### RULE-FW-202: Log Levels
- CRITICAL: Workflow-stopping errors
- ERROR: Recoverable errors
- WARN: Issues that need attention
- INFO: Normal operations
- DEBUG: Detailed diagnostic info

### RULE-FW-203: Log Files
Each agent MUST log to:
- `logs/[agent-name].log` - Agent-specific
- `logs/orchestration.log` - Main workflow log
- `logs/[agent-name]-rules.log` - Rule validations

### RULE-FW-204: Log Rotation
Logs MUST be rotated when > 10MB.

---

## Global Error Handling

### RULE-FW-301: Error Categories
1. **STOP_WORKFLOW**: Critical, cannot continue
2. **RETRY_ONCE**: Transient, attempt recovery
3. **DEGRADE_GRACEFULLY**: Continue without feature
4. **LOG_AND_CONTINUE**: Non-critical issue

### RULE-FW-302: Error Response
Every error MUST:
- Log to appropriate log file
- Create Jira bug if CRITICAL
- Notify orchestration agent
- Provide recovery suggestion

### RULE-FW-303: Retry Logic
- Maximum 1 retry for API calls
- Wait 2 seconds between retries
- Different error message on second failure

---

## Global Handoff Standards

### RULE-FW-401: Handoff Data Structure
```json
{
  "phase": "Phase Name",
  "agent": "Agent Name",
  "status": "COMPLETE|FAILED|DEGRADED",
  "timestamp": "ISO 8601 timestamp",
  "outputs": {
    "file1": "path/to/file",
    "file2": "path/to/file"
  },
  "metadata": {
    "key": "value"
  },
  "nextAgent": "Next Agent Name",
  "errors": []
}
```

### RULE-FW-402: Mandatory Handoff Fields
- phase (string)
- agent (string)
- status (enum)
- timestamp (ISO 8601)
- nextAgent (string)

### RULE-FW-403: Handoff Validation
Receiving agent MUST validate handoff data before starting.

---

## Global Security Standards

### RULE-FW-501: No Secrets in Code
NEVER commit:
- API tokens
- Passwords
- Private keys
- .env files
- Database credentials

### RULE-FW-502: Token Masking
When logging errors, MUST mask tokens:
```javascript
errorMsg.replace(process.env.JIRA_API_TOKEN, '***TOKEN***')
```

### RULE-FW-503: Input Validation
ALL user inputs MUST be validated before use.

### RULE-FW-504: Output Sanitization
ALL outputs MUST be sanitized to prevent XSS.

---

## Global Performance Standards

### RULE-FW-601: Phase Time Limits
- Requirements: < 15 minutes
- Architecture: < 20 minutes
- Backend Dev: < 25 minutes
- Frontend Dev: < 20 minutes
- Testing: < 15 minutes
- Review: < 10 minutes
- DevOps: < 15 minutes
- **Total**: < 2 hours

### RULE-FW-602: API Rate Limiting
- Jira: Max 10 requests/minute
- Confluence: Max 10 requests/minute
- GitHub: Max 60 requests/hour
- Wait between requests: Minimum 500ms

### RULE-FW-603: File Size Limits
- Markdown files: < 50 KB
- JSON files: < 1 MB
- Log files: < 10 MB (then rotate)

---

## Global Documentation Standards

### RULE-FW-701: Markdown Lint
ALL markdown files MUST pass markdownlint validation.

### RULE-FW-702: Code Comments
- Public methods: JavaDoc/JSDoc required
- Complex logic: Inline comments
- TODO/FIXME: Must have issue tracking

### RULE-FW-703: README Files
Each generated project MUST include README.md with:
- Project description
- Setup instructions
- How to run
- How to test

---

## Global Testing Standards

### RULE-FW-801: Coverage Minimums
- Backend: 80%
- Frontend: 70%
- Integration: 60%

### RULE-FW-802: Test Naming
- Backend: `test<Method>_<Scenario>_<Expected>`
- Frontend: `'should <expected> when <scenario>'`

### RULE-FW-803: No Flaky Tests
Tests MUST be deterministic and repeatable.

---

## Global Jira Integration Standards

### RULE-FW-901: Issue Creation
When creating issues:
- MUST include project key
- MUST have meaningful summary (< 255 chars)
- MUST have detailed description
- MUST set appropriate priority
- MUST add labels: ['agentic-sdlc', 'auto-generated']

### RULE-FW-902: Issue Updates
When updating issues:
- MUST add comment explaining change
- MUST update status appropriately
- MUST link related issues

### RULE-FW-903: Epic Structure
- One Epic per user story
- All stories linked to Epic
- Epic contains full requirements

---

## Global Confluence Integration Standards

### RULE-FW-1001: Page Creation
- MUST use consistent title format: `[Project] - [Type]`
- MUST add to correct space
- MUST include creation timestamp
- MUST link to Jira Epic

### RULE-FW-1002: HTML Format
- MUST be well-formed HTML
- MUST use Confluence storage format
- MUST include proper headings

### RULE-FW-1003: Page Updates
- MUST increment version number
- MUST add update comment

---

## Global Validation Standards

### RULE-FW-1101: Pre-Execution Validation
Every agent MUST verify:
- Required files exist
- Environment variables set
- Tools available (Maven, npm, etc.)
- Previous phase completed successfully

### RULE-FW-1102: Post-Execution Validation
Every agent MUST verify:
- All outputs created
- No critical errors
- Handoff data prepared
- Logs written

### RULE-FW-1103: Output Validation
- Files MUST be readable
- JSON MUST be parsable
- Markdown MUST be valid
- Code MUST compile/run

---

## Global Audit Requirements

### RULE-FW-1201: Audit Trail
MUST log:
- Every agent execution start/end
- Every file created/modified
- Every API call made
- Every error encountered
- Every rule validation

### RULE-FW-1202: Metrics Collection
MUST track:
- Execution time per phase
- File counts and sizes
- API call counts
- Error counts
- Test coverage percentages

### RULE-FW-1203: Audit File
Create `audit/run-[timestamp].json` with complete execution details.

---

## Rule Violation Procedures

### If CRITICAL Rule Violated:
1. Stop workflow immediately
2. Log error to all relevant logs
3. Create Jira bug with priority: Critical
4. Notify user with clear error message
5. Provide recovery instructions

### If HIGH Rule Violated:
1. Log warning
2. Attempt auto-fix if possible
3. Create Jira bug with priority: High
4. Continue execution

### If MEDIUM Rule Violated:
1. Log info message
2. Continue execution
3. Include in final report

---

## Framework Versioning

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Compatible Agents**: All v1.x agents

---

## Related Files
- All agent instructions: `.github/copilot/instructions/`
- All agent rules: `.github/copilot/rules/`
- Main orchestration: `.github/copilot/instructions.md`
