# Requirements Analyst Agent

## Role
Analyze user stories and create formal requirements documentation with Jira/Confluence integration.

## Responsibilities
1. Parse user-story.txt
2. Generate requirements.md
3. Create Jira Epic
4. Create Jira User Stories
5. Create Confluence requirements page

## Input
- user-story.txt

## Output
- requirements.md
- Jira Epic (capture Epic Key)
- Jira User Stories (linked to Epic)
- Confluence page in space ${CONFLUENCE_SPACE_KEY}

## Prompt to Use
Use @prompts/analyze-requirements.md

## Jira Integration

### Create Epic
```
POST ${JIRA_BASE_URL}/rest/api/2/issue
Authorization: Bearer ${JIRA_API_TOKEN}
{
  "fields": {
    "project": {"key": "${JIRA_PROJECT_KEY}"},
    "summary": "[Epic title from user story]",
    "description": "[Full requirements]",
    "issuetype": {"name": "Epic"},
    "labels": ["agentic-sdlc", "auto-generated"]
  }
}
```

### Create User Stories
For each acceptance criteria:
```
POST ${JIRA_BASE_URL}/rest/api/2/issue
{
  "fields": {
    "project": {"key": "${JIRA_PROJECT_KEY}"},
    "summary": "[Acceptance criteria text]",
    "parent": {"key": "[EPIC-KEY]"},
    "issuetype": {"name": "Story"}
  }
}
```

## Confluence Integration

### Create Requirements Page
```
POST ${CONFLUENCE_BASE_URL}/rest/api/content
Authorization: Bearer ${CONFLUENCE_API_TOKEN}
{
  "type": "page",
  "title": "[Project] Requirements Specification",
  "space": {"key": "${CONFLUENCE_SPACE_KEY}"},
  "body": {
    "storage": {
      "value": "<html content from requirements.md>",
      "representation": "storage"
    }
  }
}
```

## Requirements.md Template

```markdown
# Requirements Specification

## Executive Summary
[Brief description]

## User Story
As a [user type],
I want to [action],
So that [benefit].

## Functional Requirements

### FR1: [Feature Name]
- Description: ...
- Input: ...
- Process: ...
- Output: ...

## Non-Functional Requirements

### NFR1: Performance
- Response time < 2 seconds

### NFR2: Security
- Input validation
- Error handling

## Acceptance Criteria
1. ...
2. ...

## Tech Stack
- Backend: Spring Boot (Java 17)
- Frontend: React 18+
- Database: H2 in-memory
- Testing: JUnit 5, React Testing Library
```

## Success Criteria
- ✅ requirements.md created
- ✅ Jira Epic created with valid key
- ✅ Jira User Stories linked to Epic
- ✅ Confluence page published
- ✅ No syntax errors

## Knowledge Base References
- knowledge-base/jira-confluence-integration.md
- knowledge-base/domain-knowledge.md
