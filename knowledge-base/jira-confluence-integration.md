# Jira and Confluence Integration Guide

## Overview
This framework integrates with Atlassian Jira and Confluence to automatically create tickets and documentation throughout the SDLC.

---

## Jira Integration

### Base Configuration
- **Base URL**: https://jiraeu.epam.com
- **API Version**: REST API v2
- **Authentication**: Bearer Token
- **Project Key**: EPM (or configured in .env)

### API Endpoints Used

#### 1. Create Epic
```
POST ${JIRA_BASE_URL}/rest/api/2/issue
Authorization: Bearer ${JIRA_API_TOKEN}
Content-Type: application/json

{
  "fields": {
    "project": {"key": "EPM"},
    "summary": "Epic: Task Manager Application",
    "description": "Full requirements text here",
    "issuetype": {"name": "Epic"},
    "labels": ["agentic-sdlc", "auto-generated"]
  }
}

Response:
{
  "key": "EPM-123",
  "id": "10001",
  "self": "https://jiraeu.epam.com/rest/api/2/issue/10001"
}
```

#### 2. Create User Story
```
POST ${JIRA_BASE_URL}/rest/api/2/issue

{
  "fields": {
    "project": {"key": "EPM"},
    "summary": "User can add a new task",
    "description": "Acceptance criteria details",
    "issuetype": {"name": "Story"},
    "parent": {"key": "EPM-123"},
    "labels": ["agentic-sdlc"]
  }
}
```

#### 3. Transition Issue (Update Status)
```
PUT ${JIRA_BASE_URL}/rest/api/2/issue/{issueKey}/transitions

{
  "transition": {"id": "31"}  # ID for "Done" transition
}

# Common transition IDs:
# To Do: 11
# In Progress: 21
# Done: 31
# Note: IDs may vary by Jira configuration
```

#### 4. Add Comment
```
POST ${JIRA_BASE_URL}/rest/api/2/issue/{issueKey}/comment

{
  "body": "Backend code generated successfully.\n\nFiles created:\n- TaskController.java\n- TaskService.java\n- TaskRepository.java"
}
```

#### 5. Create Bug
```
POST ${JIRA_BASE_URL}/rest/api/2/issue

{
  "fields": {
    "project": {"key": "EPM"},
    "summary": "[Critical] SQL Injection Vulnerability in Task API",
    "description": "Details of the security issue...",
    "issuetype": {"name": "Bug"},
    "priority": {"name": "Critical"},
    "labels": ["security", "agentic-sdlc"]
  }
}
```

#### 6. Get Issue
```
GET ${JIRA_BASE_URL}/rest/api/2/issue/{issueKey}

Response includes:
- fields: All issue fields
- status: Current status
- transitions: Available transitions
```

---

## Confluence Integration

### Base Configuration
- **Base URL**: https://confluence.epam.com
- **API Version**: REST API
- **Authentication**: Bearer Token
- **Space Key**: gitHubSpac

### API Endpoints Used

#### 1. Create Page
```
POST ${CONFLUENCE_BASE_URL}/rest/api/content
Authorization: Bearer ${CONFLUENCE_API_TOKEN}
Content-Type: application/json

{
  "type": "page",
  "title": "Task Manager - Requirements Specification",
  "space": {"key": "gitHubSpac"},
  "body": {
    "storage": {
      "value": "<h1>Requirements</h1><p>Content here...</p>",
      "representation": "storage"
    }
  }
}

Response:
{
  "id": "12345",
  "type": "page",
  "title": "Task Manager - Requirements Specification",
  "_links": {
    "webui": "/wiki/spaces/gitHubSpac/pages/12345",
    "self": "https://confluence.epam.com/rest/api/content/12345"
  }
}
```

#### 2. Update Page
```
PUT ${CONFLUENCE_BASE_URL}/rest/api/content/{pageId}

{
  "id": "12345",
  "type": "page",
  "title": "Task Manager - Requirements Specification",
  "space": {"key": "gitHubSpac"},
  "version": {"number": 2},
  "body": {
    "storage": {
      "value": "<h1>Updated Requirements</h1>",
      "representation": "storage"
    }
  }
}
```

#### 3. Get Page
```
GET ${CONFLUENCE_BASE_URL}/rest/api/content/{pageId}?expand=body.storage,version

Returns:
- title
- body.storage.value (HTML content)
- version.number
```

#### 4. Search Pages
```
GET ${CONFLUENCE_BASE_URL}/rest/api/content/search?cql=space=gitHubSpac+AND+title~"Task Manager"

Returns list of matching pages
```

---

## Markdown to Confluence HTML Conversion

Confluence uses a specific HTML format. Key conversions:

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```
→
```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
```

### Lists
```markdown
- Item 1
- Item 2
```
→
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

### Code Blocks
```markdown
\`\`\`java
public class Task {}
\`\`\`
```
→
```html
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">java</ac:parameter>
  <ac:plain-text-body><![CDATA[public class Task {}]]></ac:plain-text-body>
</ac:structured-macro>
```

### Links
```markdown
[Link Text](https://example.com)
```
→
```html
<a href="https://example.com">Link Text</a>
```

---

## Error Handling

### Common Errors

#### 401 Unauthorized
- **Cause**: Invalid API token
- **Solution**: Verify token in `.env` file, regenerate if needed

#### 403 Forbidden
- **Cause**: Token lacks permissions
- **Solution**: Ensure token has:
  - Jira: Create issues, Edit issues, Add comments
  - Confluence: Create pages, Edit pages

#### 404 Not Found
- **Cause**: Space/Project doesn't exist
- **Solution**: Verify space key and project key

#### 400 Bad Request
- **Cause**: Invalid JSON or missing required fields
- **Solution**: Validate JSON payload

---

## Best Practices

### 1. Token Management
- Store tokens in `.env` file (never commit)
- Use same token for Jira and Confluence if possible
- Rotate tokens regularly

### 2. Error Handling
```javascript
try {
  const response = await createJiraEpic(data);
  console.log(`Epic created: ${response.key}`);
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Authentication failed. Check API token.');
  } else if (error.response?.status === 400) {
    console.error('Invalid request:', error.response.data);
  } else {
    console.error('Jira API error:', error.message);
  }
  // Continue with local files only
}
```

### 3. Retry Logic
```javascript
async function createWithRetry(fn, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### 4. Rate Limiting
- Jira/Confluence have rate limits
- Add delays between bulk operations
- Use batch APIs when available

---

## Testing Integration

### Test Jira Connection
```bash
curl -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
  https://jiraeu.epam.com/rest/api/2/myself
```

Expected response: Your user details

### Test Confluence Connection
```bash
curl -H "Authorization: Bearer ${CONFLUENCE_API_TOKEN}" \
  https://confluence.epam.com/rest/api/space/gitHubSpac
```

Expected response: Space details

---

## Environment Variables

Required in `.env`:

```bash
# Jira
JIRA_BASE_URL=https://jiraeu.epam.com
JIRA_API_TOKEN=your_token_here
JIRA_PROJECT_KEY=EPM
JIRA_USER_EMAIL=your_email@epam.com

# Confluence
CONFLUENCE_BASE_URL=https://confluence.epam.com
CONFLUENCE_SPACE_KEY=gitHubSpac
CONFLUENCE_SPACE_NAME=gitHubSpaceCapston
CONFLUENCE_API_TOKEN=same_token_as_jira
```

---

## Workflow Integration Points

### Phase 1: Requirements Analysis
- Create Jira Epic
- Create Jira User Stories
- Create Confluence requirements page

### Phase 2: Architecture Design
- Create Confluence architecture page

### Phase 3: Backend Development
- Update Jira tasks to "In Progress"
- Update Jira tasks to "Done"
- Add comments with generated files

### Phase 4: Frontend Development
- Update Jira tasks to "Done"
- Add comments with component list

### Phase 5: Testing
- Create Confluence test documentation page
- Add Jira comment with test results

### Phase 6: Code Review
- Create Confluence code review page
- Create Jira bugs for Critical issues
- Add Jira comment with review summary

### Phase 7: Deployment
- Update Jira Epic to "Ready for Review"
- Add Jira comment with PR link
- Create Confluence final summary page

---

## Troubleshooting

### VPN Required
If you're working remotely, you may need EPAM VPN to access Jira/Confluence.

### Token Expiration
Tokens may expire. If you get 401 errors:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create new token
3. Update `.env` file

### Space/Project Not Found
Verify the space key and project key are correct:
- Jira Project: Check in Jira UI (project settings)
- Confluence Space: Check in Space settings → Space details

---

## Related Documentation
- knowledge-base/domain-knowledge.md
- knowledge-base/common-patterns.md
