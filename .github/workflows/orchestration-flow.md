# Orchestration Flow - Complete SDLC Workflow

## Overview
This workflow defines the complete end-to-end SDLC execution from user story to production-ready application.

## Trigger
User command: `@workspace Run orchestration flow for user-story.txt`

## Workflow Phases

### Phase 1: Requirements Analysis
**Duration**: ~2-3 minutes  
**Agent**: @requirements-analyst.md  
**Prompt**: @prompts/analyze-requirements.md

**Steps**:
1. Read user-story.txt
2. Execute requirements analysis prompt
3. Generate requirements.md
4. Create Jira Epic (capture Epic Key)
5. Create Jira User Stories (link to Epic)
6. Create Confluence requirements page

**Success Criteria**:
- ✅ requirements.md exists
- ✅ Jira Epic created (have Epic Key)
- ✅ User stories created in Jira
- ✅ Confluence page published

**On Failure**: Stop workflow, create Jira bug, notify user

---

### Phase 2: Architecture Design
**Duration**: ~2-3 minutes  
**Agent**: @architect-agent.md  
**Prompt**: @prompts/design-architecture.md

**Steps**:
1. Read requirements.md
2. Execute architecture design prompt
3. Generate docs/architecture.md
4. Generate docs/api-design.md
5. Create Confluence architecture page

**Success Criteria**:
- ✅ architecture.md complete with entities and APIs
- ✅ api-design.md complete
- ✅ Confluence page published

**On Failure**: Retry once, then stop workflow

---

### Phase 3: Backend Development
**Duration**: ~5-7 minutes  
**Agent**: @developer-agent.md  
**Prompt**: @prompts/generate-backend.md

**Steps**:
1. Read docs/architecture.md
2. Execute backend generation prompt
3. Generate all Java files in src/
4. Generate pom.xml
5. Validate: `mvn clean compile`
6. Update Jira backend tasks to "Done"

**Success Criteria**:
- ✅ All Java files created
- ✅ pom.xml valid
- ✅ mvn clean compile succeeds (exit code 0)
- ✅ No compilation errors
- ✅ Jira tasks updated

**On Failure**: Review errors, regenerate problematic files, retry up to 2 times

---

### Phase 4: Frontend Development
**Duration**: ~5-7 minutes  
**Agent**: @frontend-agent.md  
**Prompt**: @prompts/generate-frontend.md

**Steps**:
1. Read docs/architecture.md and docs/api-design.md
2. Execute frontend generation prompt
3. Generate all React files in frontend/
4. Generate package.json
5. Validate: `npm install`
6. Update Jira frontend tasks to "Done"

**Success Criteria**:
- ✅ All React files created
- ✅ package.json valid
- ✅ npm install succeeds (exit code 0)
- ✅ No syntax errors
- ✅ Jira tasks updated

**On Failure**: Check dependencies, retry npm install, regenerate if needed

---

### Phase 5: Testing
**Duration**: ~5-10 minutes  
**Agent**: @tester-agent.md  
**Prompt**: @prompts/generate-tests.md

**Steps**:
1. Read generated backend code
2. Read generated frontend code
3. Execute test generation prompt
4. Generate backend tests (src/test/)
5. Generate frontend tests (*.test.js)
6. Execute: `mvn test`
7. Execute: `cd frontend && npm test -- --coverage --watchAll=false`
8. Generate test report
9. Create Confluence test page
10. Update Jira with test results

**Success Criteria**:
- ✅ Backend tests pass (mvn test exit code 0)
- ✅ Frontend tests pass (npm test exit code 0)
- ✅ Coverage > 70%
- ✅ Test report generated
- ✅ Confluence page created
- ✅ Jira updated

**On Failure**: Document failures in Jira, create bug tickets, continue to review

---

### Phase 6: Code Review
**Duration**: ~3-5 minutes  
**Agent**: @reviewer-agent.md  
**Prompt**: @prompts/code-review.md

**Steps**:
1. Read all generated code
2. Execute code review prompt
3. Analyze code quality, security, performance
4. Generate code review report
5. Create Confluence review page
6. Create Jira bugs for Critical issues
7. Update Jira Epic with review status

**Success Criteria**:
- ✅ Code review report generated
- ✅ No Critical issues (or all documented)
- ✅ Confluence page created
- ✅ Jira updated

**On Failure**: Log issues, continue (don't block)

---

### Phase 7: Deployment & PR
**Duration**: ~3-5 minutes  
**Agent**: @devops-agent.md  
**Prompt**: @prompts/create-pr.md

**Steps**:
1. Build backend: `mvn clean package`
2. Build frontend: `cd frontend && npm run build`
3. Create Git branch: `feature/agentic-sdlc-[timestamp]`
4. Stage and commit all changes
5. Push to remote
6. Create GitHub Pull Request via API
7. Start backend: `mvn spring-boot:run` (background)
8. Start frontend: `cd frontend && npm start` (background)
9. Verify deployment (check http://localhost:8080 and :3000)
10. Update Jira Epic to "Ready for Review"
11. Create Confluence final summary page

**Success Criteria**:
- ✅ Backend builds (mvn package exit code 0)
- ✅ Frontend builds (npm run build exit code 0)
- ✅ Git branch created and pushed
- ✅ GitHub PR created
- ✅ Backend running on localhost:8080
- ✅ Frontend running on localhost:3000
- ✅ Jira Epic status = "Ready for Review"
- ✅ Confluence summary created

**On Failure**: Document error, create Jira bug, stop deployment (PR still created if possible)

---

## Final Output Summary

After successful completion, display:

```
🎉 Agentic SDLC Workflow Complete!

Project: [Project Name]
Jira Epic: [EPIC-KEY] - https://jiraeu.epam.com/browse/[EPIC-KEY]
Pull Request: [PR-URL]
Confluence Space: https://confluence.epam.com/wiki/spaces/gitHubSpac

Phase Results:
✅ Phase 1: Requirements Analysis - Success
✅ Phase 2: Architecture Design - Success
✅ Phase 3: Backend Development - Success
✅ Phase 4: Frontend Development - Success
✅ Phase 5: Testing - [XX]/[XX] tests passed
✅ Phase 6: Code Review - [Status]
✅ Phase 7: Deployment & PR - Success

Local Deployment:
- Backend: http://localhost:8080 ✅
- Frontend: http://localhost:3000 ✅
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console (user: sa, password: empty)

Generated Files:
- requirements.md
- docs/architecture.md
- docs/api-design.md
- src/ (XX Java files)
- frontend/ (XX React files)
- Tests: XX files

Test Results:
- Total Tests: XX
- Passed: XX
- Failed: XX
- Coverage: XX%

Code Review:
- Status: [Approved/Approved with comments/Changes required]
- Critical Issues: XX
- Total Issues: XX

Next Steps:
1. Review Pull Request: [PR-URL]
2. Test application locally
3. Review Confluence documentation
4. Approve and merge PR to main
5. Deploy to production environment

Documentation:
- Requirements: [Confluence URL]
- Architecture: [Confluence URL]
- Test Report: [Confluence URL]
- Code Review: [Confluence URL]
- Final Summary: [Confluence URL]
```

## Error Handling

At any phase, if an error occurs:
1. Log error to `logs/orchestration.log`
2. Create Jira bug ticket with:
   - Title: `[Phase Name] Failed - [Error Summary]`
   - Description: Full error stack trace
   - Priority: Critical
   - Link to Epic
3. Notify user with error details and recovery options
4. Retry up to 2 times for transient errors
5. If still failing, stop workflow

## Environment Variables Required

Ensure these are set in `.env`:
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

## Logging

Create detailed logs in `logs/` directory:
- `orchestration.log` - Main workflow log
- `requirements.log` - Phase 1 log
- `architecture.log` - Phase 2 log
- `backend.log` - Phase 3 log
- `frontend.log` - Phase 4 log
- `testing.log` - Phase 5 log
- `review.log` - Phase 6 log
- `devops.log` - Phase 7 log

## Metrics

Track and store in `metrics/run-[timestamp].json`:
- Total execution time
- Time per phase
- Files generated
- Tests written and passed
- Code review issues
- Jira items created
- Confluence pages created

## Version
**Workflow Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Compatible with**: Agentic SDLC Framework v1.0
