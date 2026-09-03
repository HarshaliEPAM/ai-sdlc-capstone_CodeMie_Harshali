# Requirements Analyst Agent - Mandatory Rules

## Rule Category: CRITICAL (Violation = Stop Workflow)

### RULE-REQ-001: User Story File Validation
**Rule**: `user-story.txt` MUST exist and be non-empty before proceeding.
**Validation**:
```javascript
if (!fs.existsSync('user-story.txt')) {
    STOP_WORKFLOW('user-story.txt not found');
}
if (fs.readFileSync('user-story.txt', 'utf-8').trim().length === 0) {
    STOP_WORKFLOW('user-story.txt is empty');
}
```
**Penalty**: Stop workflow immediately
**Recovery**: None - user must provide valid file

---

### RULE-REQ-002: User Story Structure
**Rule**: User story MUST contain ALL of these sections:
- Title
- User Story (with "As a", "I want", "So that")
- Acceptance Criteria (numbered list)

**Validation**:
```javascript
const content = readFile('user-story.txt');
if (!content.match(/Title:/i)) {
    STOP_WORKFLOW('Missing Title section');
}
if (!content.match(/User Story:/i)) {
    STOP_WORKFLOW('Missing User Story section');
}
if (!content.match(/As a.*I want.*So that/is)) {
    STOP_WORKFLOW('User story not in standard format');
}
if (!content.match(/Acceptance Criteria:/i)) {
    STOP_WORKFLOW('Missing Acceptance Criteria');
}
if (!content.match(/\d+\.\s+/)) {
    STOP_WORKFLOW('Acceptance Criteria must be numbered');
}
```
**Penalty**: Stop workflow immediately
**Recovery**: User must fix user-story.txt format

---

### RULE-REQ-003: Acceptance Criteria Count
**Rule**: MUST have at least 2 acceptance criteria, maximum 10.
**Validation**:
```javascript
const criteria = extractAcceptanceCriteria(content);
if (criteria.length < 2) {
    STOP_WORKFLOW('Minimum 2 acceptance criteria required');
}
if (criteria.length > 10) {
    STOP_WORKFLOW('Maximum 10 acceptance criteria allowed (split into multiple epics)');
}
```
**Penalty**: Stop workflow
**Recovery**: User must adjust criteria count

---

### RULE-REQ-004: Environment Variables
**Rule**: ALL required environment variables MUST be set.
**Required Variables**:
- JIRA_BASE_URL
- JIRA_API_TOKEN
- JIRA_PROJECT_KEY
- JIRA_USER_EMAIL
- CONFLUENCE_BASE_URL
- CONFLUENCE_SPACE_KEY
- CONFLUENCE_API_TOKEN

**Validation**:
```javascript
const required = [
    'JIRA_BASE_URL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY', 'JIRA_USER_EMAIL',
    'CONFLUENCE_BASE_URL', 'CONFLUENCE_SPACE_KEY', 'CONFLUENCE_API_TOKEN'
];
for (const varName of required) {
    if (!process.env[varName]) {
        STOP_WORKFLOW(`Missing environment variable: ${varName}`);
    }
}
```
**Penalty**: Stop workflow
**Recovery**: User must configure .env file

---

## Rule Category: HIGH (Violation = Warning + Continue)

### RULE-REQ-101: Requirements Document Structure
**Rule**: requirements.md MUST contain these sections IN ORDER:
1. Executive Summary
2. User Story
3. Functional Requirements
4. Non-Functional Requirements
5. Acceptance Criteria
6. Tech Stack

**Validation**:
```javascript
const sections = [
    '## Executive Summary',
    '## User Story',
    '## Functional Requirements',
    '## Non-Functional Requirements',
    '## Acceptance Criteria',
    '## Tech Stack'
];
const content = readFile('requirements.md');
for (const section of sections) {
    if (!content.includes(section)) {
        WARN(`Missing section: ${section}`);
    }
}
// Check order
let lastIndex = -1;
for (const section of sections) {
    const index = content.indexOf(section);
    if (index <= lastIndex) {
        WARN(`Section out of order: ${section}`);
    }
    lastIndex = index;
}
```
**Penalty**: Warning logged
**Recovery**: Auto-fix by regenerating with correct structure

---

### RULE-REQ-102: Functional Requirements Numbering
**Rule**: Functional Requirements MUST be numbered sequentially: FR1, FR2, FR3...
**Validation**:
```javascript
const frMatches = content.match(/### FR(\d+):/g);
if (!frMatches || frMatches.length === 0) {
    WARN('No Functional Requirements found');
} else {
    for (let i = 0; i < frMatches.length; i++) {
        const expected = `### FR${i + 1}:`;
        if (frMatches[i] !== expected) {
            WARN(`FR numbering error: expected ${expected}, got ${frMatches[i]}`);
        }
    }
}
```
**Penalty**: Warning logged
**Recovery**: Auto-fix numbering

---

### RULE-REQ-103: Non-Functional Requirements Minimum
**Rule**: MUST have at least 3 Non-Functional Requirements covering:
- Performance
- Security
- Maintainability (or equivalent)

**Validation**:
```javascript
const nfrMatches = content.match(/### NFR\d+:/g);
if (!nfrMatches || nfrMatches.length < 3) {
    WARN(`Only ${nfrMatches?.length || 0} NFRs found, minimum 3 required`);
}
// Check for required categories
const nfrContent = content.substring(
    content.indexOf('## Non-Functional Requirements'),
    content.indexOf('## Acceptance Criteria')
);
if (!nfrContent.match(/performance/i)) {
    WARN('Missing Performance NFR');
}
if (!nfrContent.match(/security/i)) {
    WARN('Missing Security NFR');
}
```
**Penalty**: Warning logged
**Recovery**: Add missing NFRs

---

### RULE-REQ-104: Jira Summary Length
**Rule**: Jira issue summaries MUST be 255 characters or less.
**Validation**:
```javascript
if (epicPayload.fields.summary.length > 255) {
    WARN(`Epic summary too long (${epicPayload.fields.summary.length} chars), truncating`);
    epicPayload.fields.summary = epicPayload.fields.summary.substring(0, 255);
}
for (const story of storyPayloads) {
    if (story.fields.summary.length > 255) {
        WARN(`Story summary too long, truncating: ${story.fields.summary}`);
        story.fields.summary = story.fields.summary.substring(0, 255);
    }
}
```
**Penalty**: Auto-truncate
**Recovery**: Automatic

---

## Rule Category: MEDIUM (Violation = Info Log)

### RULE-REQ-201: Technical Requirements Specification
**Rule**: User story SHOULD include Technical Requirements section.
**Validation**:
```javascript
if (!content.match(/Technical Requirements:/i)) {
    INFO('No Technical Requirements specified, using framework defaults');
    technicalRequirements = {
        backend: 'Spring Boot (Java 17)',
        frontend: 'React 18+',
        database: 'H2 in-memory',
        testing: 'JUnit 5, React Testing Library'
    };
}
```
**Penalty**: Info log
**Recovery**: Use defaults from knowledge-base/tech-stack.md

---

### RULE-REQ-202: Executive Summary Length
**Rule**: Executive Summary SHOULD be 3-5 sentences (50-200 words).
**Validation**:
```javascript
const execSummary = extractSection(content, 'Executive Summary');
const wordCount = execSummary.split(/\s+/).length;
if (wordCount < 50) {
    INFO(`Executive Summary is short (${wordCount} words)`);
}
if (wordCount > 200) {
    INFO(`Executive Summary is long (${wordCount} words), consider condensing`);
}
```
**Penalty**: Info log
**Recovery**: None required

---

### RULE-REQ-203: Jira API Rate Limiting
**Rule**: MUST wait at least 500ms between Jira API calls.
**Validation**:
```javascript
let lastJiraCall = 0;
async function jiraApiCall(endpoint, payload) {
    const now = Date.now();
    const elapsed = now - lastJiraCall;
    if (elapsed < 500) {
        await sleep(500 - elapsed);
    }
    const response = await axios.post(endpoint, payload);
    lastJiraCall = Date.now();
    return response;
}
```
**Penalty**: Auto-enforce delay
**Recovery**: Automatic

---

### RULE-REQ-204: Confluence HTML Validation
**Rule**: Confluence HTML MUST be well-formed (no unclosed tags).
**Validation**:
```javascript
const htmlValidator = require('html-validator');
const result = await htmlValidator({ data: confluenceHtml });
if (result.messages.length > 0) {
    for (const msg of result.messages) {
        if (msg.type === 'error') {
            WARN(`HTML validation error: ${msg.message} at line ${msg.lastLine}`);
        }
    }
}
```
**Penalty**: Warning log
**Recovery**: Attempt auto-fix common issues

---

## Rule Category: VALIDATION (Must Pass Before Handoff)

### RULE-REQ-301: File Output Validation
**Rule**: requirements.md MUST be created and readable.
**Validation**:
```javascript
if (!fs.existsSync('requirements.md')) {
    STOP_WORKFLOW('requirements.md not created');
}
const content = fs.readFileSync('requirements.md', 'utf-8');
if (content.length < 500) {
    STOP_WORKFLOW('requirements.md too short, likely incomplete');
}
if (content.length > 50000) {
    WARN('requirements.md very large (>50KB), consider splitting');
}
```
**Penalty**: Stop workflow if not created
**Recovery**: Regenerate

---

### RULE-REQ-302: Markdown Syntax Validation
**Rule**: requirements.md MUST be valid Markdown.
**Validation**:
```javascript
const markdownlint = require('markdownlint');
const result = markdownlint.sync({ files: ['requirements.md'] });
if (result.requirements_md && result.requirements_md.length > 0) {
    for (const error of result.requirements_md) {
        WARN(`Markdown lint: ${error.ruleDescription} at line ${error.lineNumber}`);
    }
}
```
**Penalty**: Warning log
**Recovery**: Auto-fix common markdown issues

---

### RULE-REQ-303: Jira Epic Key Format
**Rule**: Epic Key MUST match format: [A-Z]+-\d+ or be "LOCAL-ONLY".
**Validation**:
```javascript
const epicKey = getVariable('EPIC_KEY');
if (epicKey !== 'LOCAL-ONLY' && !epicKey.match(/^[A-Z]+-\d+$/)) {
    STOP_WORKFLOW(`Invalid Epic Key format: ${epicKey}`);
}
```
**Penalty**: Stop workflow
**Recovery**: None - indicates API error

---

### RULE-REQ-304: Confluence Page URL Validation
**Rule**: If Confluence page created, URL MUST be accessible.
**Validation**:
```javascript
const pageUrl = getVariable('CONFLUENCE_REQUIREMENTS_PAGE_URL');
if (pageUrl && pageUrl !== 'N/A') {
    try {
        const response = await axios.head(pageUrl);
        if (response.status !== 200) {
            WARN('Confluence page created but not accessible');
        }
    } catch (error) {
        WARN('Cannot verify Confluence page accessibility');
    }
}
```
**Penalty**: Warning log
**Recovery**: Manual verification required

---

## Rule Category: SECURITY

### RULE-REQ-401: No Sensitive Data in Output
**Rule**: requirements.md and Jira/Confluence content MUST NOT contain:
- API tokens
- Passwords
- Email addresses (except in metadata)
- Internal URLs (except Jira/Confluence)

**Validation**:
```javascript
const sensitivePatterns = [
    /api[_-]?token/i,
    /password/i,
    /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/,
    /[a-zA-Z0-9._%+-]+@(?!epam\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
];
for (const pattern of sensitivePatterns) {
    if (content.match(pattern)) {
        CRITICAL_ERROR('Sensitive data detected in output, removing');
        content = content.replace(pattern, '[REDACTED]');
    }
}
```
**Penalty**: Auto-redact + critical error log
**Recovery**: Automatic redaction

---

### RULE-REQ-402: Jira API Token Protection
**Rule**: NEVER log or output the full API token.
**Validation**:
```javascript
// When logging errors, mask token
function logError(message, error) {
    let errorMsg = error.toString();
    if (process.env.JIRA_API_TOKEN) {
        errorMsg = errorMsg.replace(process.env.JIRA_API_TOKEN, '***TOKEN***');
    }
    if (process.env.CONFLUENCE_API_TOKEN) {
        errorMsg = errorMsg.replace(process.env.CONFLUENCE_API_TOKEN, '***TOKEN***');
    }
    log(`[ERROR] ${message}: ${errorMsg}`);
}
```
**Penalty**: Critical error if token exposed
**Recovery**: Automatic masking

---

## Rule Category: PERFORMANCE

### RULE-REQ-501: Execution Time Limit
**Rule**: Total execution time MUST NOT exceed 15 minutes.
**Validation**:
```javascript
const startTime = Date.now();
// ... execution ...
const elapsed = Date.now() - startTime;
if (elapsed > 15 * 60 * 1000) {
    WARN(`Execution time exceeded 15 minutes (${Math.round(elapsed/1000)}s)`);
}
```
**Penalty**: Warning log
**Recovery**: Review for optimization opportunities

---

### RULE-REQ-502: API Call Retry Limit
**Rule**: Failed API calls may retry ONCE, then must fail gracefully.
**Validation**:
```javascript
async function apiCallWithRetry(fn, maxRetries = 1) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries) {
                WARN('API call failed after retry, continuing in degraded mode');
                return null;
            }
            await sleep(2000);
        }
    }
}
```
**Penalty**: Graceful degradation
**Recovery**: Continue without Jira/Confluence integration

---

## Rule Enforcement Levels

| Level | Description | Action |
|-------|-------------|--------|
| **CRITICAL** | Violation prevents workflow | Stop immediately, create Jira bug |
| **HIGH** | Significant issue | Warn + attempt auto-fix |
| **MEDIUM** | Minor issue | Info log + continue |
| **VALIDATION** | Output quality check | Must pass before handoff |
| **SECURITY** | Security concern | Auto-redact + critical log |
| **PERFORMANCE** | Performance issue | Log for review |

---

## Audit Trail Requirements

EVERY rule validation MUST be logged:
```
[TIMESTAMP] [RULE-REQ-001] PASS - user-story.txt exists
[TIMESTAMP] [RULE-REQ-002] PASS - User story structure valid
[TIMESTAMP] [RULE-REQ-104] WARN - Epic summary truncated (270 chars -> 255)
[TIMESTAMP] [RULE-REQ-203] INFO - Rate limiting enforced (waited 300ms)
```

Log file: `logs/requirements-rules.log`

---

## Rule Violation Reporting

If ANY CRITICAL rule fails:
1. Stop workflow immediately
2. Create Jira bug:
   ```javascript
   {
       summary: `[Requirements] ${ruleId} - ${ruleDescription}`,
       description: `Rule violated: ${ruleId}\n\nDetails: ${violationDetails}`,
       priority: 'Critical',
       labels: ['agentic-sdlc', 'rule-violation']
   }
   ```
3. Log to `logs/rule-violations.log`
4. Notify user with clear error message

---

## Related Files
- Instructions: `.github/copilot/instructions/requirements-analyst-instructions.md`
- Agent Definition: `.github/copilot/requirements-analyst.md`
- Framework Rules: `.github/copilot/rules/framework-rules.md`
