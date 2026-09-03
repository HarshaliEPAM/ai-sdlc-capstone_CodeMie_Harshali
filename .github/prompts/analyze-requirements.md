# Analyze Requirements Prompt

## Purpose
Parse user-story.txt and generate formal requirements documentation.

## Input
- user-story.txt file content

## Expected Output
- requirements.md with formal structure
- Jira Epic creation payload
- Jira User Stories creation payloads
- Confluence page content

## Prompt Template

```
You are a Requirements Analyst AI agent. Analyze the following user story and generate comprehensive requirements documentation.

User Story:
{user_story_content}

Generate:

1. **requirements.md** with this structure:
   - Executive Summary
   - User Story (formatted)
   - Functional Requirements (FR1, FR2, etc.)
   - Non-Functional Requirements (NFR1, NFR2, etc.)
   - Acceptance Criteria (numbered list)
   - Tech Stack (Spring Boot + React + H2)

2. **Jira Epic JSON** for API creation:
   - Project: ${JIRA_PROJECT_KEY}
   - Summary: [Epic title from user story]
   - Description: Full requirements
   - Issue Type: Epic
   - Labels: ["agentic-sdlc", "auto-generated"]

3. **Jira User Stories JSON** (one per acceptance criteria):
   - Link to Epic
   - Summary: [Each acceptance criteria]
   - Issue Type: Story

4. **Confluence Page Content** (HTML format):
   - Convert requirements.md to HTML
   - Title: "[Project] Requirements Specification"
   - Space: ${CONFLUENCE_SPACE_KEY}

Ensure:
- All requirements are clear and testable
- Functional requirements have FR prefix
- Non-functional requirements have NFR prefix
- Acceptance criteria are numbered
- Tech stack matches architecture standards

Return as structured JSON with keys:
- requirements_md: string
- jira_epic: object
- jira_stories: array
- confluence_html: string
```

## Usage Example

```javascript
const prompt = loadPrompt('analyze-requirements.md');
const userStory = fs.readFileSync('user-story.txt', 'utf-8');
const result = await copilot.execute(prompt.replace('{user_story_content}', userStory));
```

## Validation Checklist

After generation, verify:
- ✅ requirements.md is valid Markdown
- ✅ All FR and NFR have descriptions
- ✅ Acceptance criteria match user story
- ✅ Jira JSON is valid
- ✅ Confluence HTML is well-formed

## Knowledge Base References
- knowledge-base/domain-knowledge.md
- docs/business-rules.md
