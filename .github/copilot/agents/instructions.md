# Agentic SDLC - Main Orchestration Instructions

## Purpose
This file contains the main orchestration logic for the Agentic SDLC Framework. It coordinates all specialized agents to transform a user story into a production-ready application.

## Workflow Overview

When a user requests: **"Run orchestration flow for user-story.txt"**

Execute the following phases in sequence:

### Phase 1: Requirements Analysis
**Agent**: @requirements-analyst.md
**Input**: user-story.txt
**Output**: requirements.md, Jira Epic, Confluence page
**Success Criteria**: requirements.md exists, Jira Epic created

### Phase 2: Architecture Design
**Agent**: @architect-agent.md
**Input**: requirements.md
**Output**: architecture.md, API specifications
**Success Criteria**: architecture.md exists with complete specs

### Phase 3: Backend Development
**Agent**: @developer-agent.md (backend)
**Input**: architecture.md
**Output**: Spring Boot application in src/
**Success Criteria**: mvn clean compile succeeds

### Phase 4: Frontend Development
**Agent**: @frontend-agent.md
**Input**: architecture.md
**Output**: React application in frontend/
**Success Criteria**: npm install succeeds

### Phase 5: Testing
**Agent**: @tester-agent.md
**Input**: Generated code
**Output**: Test files, test execution results
**Success Criteria**: All tests pass, coverage > 70%

### Phase 6: Code Review
**Agent**: @reviewer-agent.md
**Input**: All generated code
**Output**: Code review report
**Success Criteria**: No Critical issues

### Phase 7: Deployment & PR
**Agent**: @devops-agent.md
**Input**: Reviewed code
**Output**: GitHub PR, local deployment
**Success Criteria**: PR created, app running locally

## Environment Variables Required

Load from `.env` file:
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

## Error Handling

If any phase fails:
1. Log error to logs/orchestration.log
2. Create Jira bug ticket with error details
3. Retry up to 2 times
4. If still failing, stop and notify user

## Success Message

After all phases complete:
```
✅ Agentic SDLC Complete!

Project: [name]
Jira Epic: [url]
Pull Request: [url]
Local URLs:
  - Backend: http://localhost:8080
  - Frontend: http://localhost:3000
  - Swagger: http://localhost:8080/swagger-ui.html

Next Steps:
1. Review Pull Request
2. Test application locally
3. Approve and merge
```

## Prompts Used

- @prompts/analyze-requirements.md
- @prompts/design-architecture.md
- @prompts/generate-backend.md
- @prompts/generate-frontend.md
- @prompts/generate-tests.md
- @prompts/code-review.md
- @prompts/create-pr.md

## Knowledge Base

Refer to:
- knowledge-base/tech-stack.md for technology decisions
- knowledge-base/jira-confluence-integration.md for API usage
- knowledge-base/common-patterns.md for code patterns
