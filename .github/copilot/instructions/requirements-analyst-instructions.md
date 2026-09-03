# Requirements Analyst Agent - Detailed Instructions

## Agent Identity
**Name**: Requirements Analyst Agent  
**Role**: Transform user stories into formal requirements and create Jira/Confluence artifacts  
**Reports To**: Orchestration Agent  
**Next Agent**: Architect Agent

---

## Pre-Execution Checklist

Before starting, verify:
- [ ] `user-story.txt` file exists and is readable
- [ ] Environment variables loaded from `.env`:
  - `JIRA_BASE_URL`
  - `JIRA_API_TOKEN`
  - `JIRA_PROJECT_KEY`
  - `JIRA_USER_EMAIL`
  - `CONFLUENCE_BASE_URL`
  - `CONFLUENCE_SPACE_KEY`
  - `CONFLUENCE_API_TOKEN`
- [ ] Jira API is accessible (test connection)
- [ ] Confluence API is accessible (test connection)
- [ ] Prompt file exists: `.github/prompts/analyze-requirements.md`

---

## Step-by-Step Execution Instructions

### Step 1: Read and Parse User Story (2 minutes)

**1.1 Read File**
```javascript
const userStoryContent = readFile('user-story.txt');
if (!userStoryContent || userStoryContent.trim().length === 0) {
    throw new Error('user-story.txt is empty or not found');
}
```

**1.2 Parse Structure**
Extract these mandatory sections:
- **Title**: First line starting with "Title:"
- **User Story**: Section starting with "User Story:"
  - Must contain: "As a...", "I want...", "So that..."
- **Acceptance Criteria**: Numbered list (1, 2, 3, ...)
- **Technical Requirements**: Technology specifications

**1.3 Validate Parsing**
```javascript
if (!title) throw new Error('Missing Title in user-story.txt');
if (!userStory) throw new Error('Missing User Story section');
if (!acceptanceCriteria || acceptanceCriteria.length === 0) {
    throw new Error('Missing Acceptance Criteria');
}
if (!technicalRequirements) {
    console.warn('Technical Requirements not specified, using defaults');
}
```

**Validation Checkpoint 1**: ✅ User story parsed successfully

---

### Step 2: Generate Requirements Document (5 minutes)

**2.1 Load Prompt Template**
```javascript
const promptTemplate = readFile('.github/prompts/analyze-requirements.md');
const prompt = promptTemplate.replace('{user_story_content}', userStoryContent);
```

**2.2 Execute AI Prompt**
```javascript
const result = await executePrompt(prompt);
// Expected output structure:
// {
//   requirements_md: string,
//   jira_epic: object,
//   jira_stories: array,
//   confluence_html: string
// }
```

**2.3 Generate requirements.md**

Must include these sections (in order):
1. **Executive Summary** (3-5 sentences)
2. **User Story** (formatted As a/I want/So that)
3. **Functional Requirements**
   - Format: FR1, FR2, FR3...
   - Each with: Description, Input, Process, Output
4. **Non-Functional Requirements**
   - Format: NFR1, NFR2, NFR3...
   - Must include: Performance, Security, Maintainability
5. **Acceptance Criteria** (numbered, matching user story)
6. **Tech Stack** (from technical requirements or defaults)
7. **Assumptions** (if any)
8. **Constraints** (if any)

**2.4 Validate requirements.md**
```javascript
const reqContent = result.requirements_md;

// Validate sections exist
if (!reqContent.includes('# Requirements Specification')) {
    throw new Error('Missing main heading');
}
if (!reqContent.includes('## Executive Summary')) {
    throw new Error('Missing Executive Summary');
}
if (!reqContent.includes('## Functional Requirements')) {
    throw new Error('Missing Functional Requirements');
}
if (!reqContent.includes('## Non-Functional Requirements')) {
    throw new Error('Missing Non-Functional Requirements');
}

// Validate FR numbering
const frMatches = reqContent.match(/### FR\d+:/g);
if (!frMatches || frMatches.length === 0) {
    throw new Error('No Functional Requirements defined');
}

// Validate NFR numbering
const nfrMatches = reqContent.match(/### NFR\d+:/g);
if (!nfrMatches || nfrMatches.length < 3) {
    throw new Error('Minimum 3 Non-Functional Requirements required');
}
```

**2.5 Write File**
```javascript
writeFile('requirements.md', reqContent);
console.log('✅ requirements.md created');
```

**Validation Checkpoint 2**: ✅ requirements.md created and validated

---

### Step 3: Create Jira Epic (3 minutes)

**3.1 Prepare Epic Payload**
```javascript
const epicPayload = {
    fields: {
        project: { key: process.env.JIRA_PROJECT_KEY },
        summary: `Epic: ${title}`,
        description: generateJiraDescription(result.requirements_md),
        issuetype: { name: 'Epic' },
        labels: ['agentic-sdlc', 'auto-generated', `${new Date().getTime()}`]
    }
};
```

**3.2 Validate Payload**
```javascript
if (!epicPayload.fields.summary) {
    throw new Error('Epic summary is empty');
}
if (epicPayload.fields.summary.length > 255) {
    epicPayload.fields.summary = epicPayload.fields.summary.substring(0, 255);
}
if (!epicPayload.fields.description) {
    throw new Error('Epic description is empty');
}
```

**3.3 Execute API Call**
```javascript
try {
    const response = await axios.post(
        `${process.env.JIRA_BASE_URL}/rest/api/2/issue`,
        epicPayload,
        {
            headers: {
                'Authorization': `Bearer ${process.env.JIRA_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    const epicKey = response.data.key;
    const epicId = response.data.id;
    
    console.log(`✅ Jira Epic created: ${epicKey}`);
    console.log(`   URL: ${process.env.JIRA_BASE_URL}/browse/${epicKey}`);
    
    // Store for next steps
    storeVariable('EPIC_KEY', epicKey);
    storeVariable('EPIC_ID', epicId);
    
} catch (error) {
    if (error.response?.status === 401) {
        throw new Error('Jira authentication failed. Check JIRA_API_TOKEN');
    } else if (error.response?.status === 400) {
        throw new Error(`Jira API error: ${JSON.stringify(error.response.data)}`);
    } else {
        console.error('⚠️ Jira Epic creation failed, continuing with local files only');
        console.error(`Error: ${error.message}`);
        storeVariable('EPIC_KEY', 'LOCAL-ONLY');
    }
}
```

**Validation Checkpoint 3**: ✅ Jira Epic created (or gracefully handled)

---

### Step 4: Create Jira User Stories (5 minutes)

**4.1 Iterate Through Acceptance Criteria**
```javascript
const epicKey = getVariable('EPIC_KEY');
const stories = [];

for (let i = 0; i < acceptanceCriteria.length; i++) {
    const criteria = acceptanceCriteria[i];
    
    const storyPayload = {
        fields: {
            project: { key: process.env.JIRA_PROJECT_KEY },
            summary: criteria.trim(),
            description: `User Story:\n${userStoryContent}\n\nAcceptance Criteria:\n${criteria}`,
            issuetype: { name: 'Story' },
            parent: { key: epicKey },
            labels: ['agentic-sdlc', 'auto-generated']
        }
    };
    
    // Validate
    if (storyPayload.fields.summary.length > 255) {
        storyPayload.fields.summary = storyPayload.fields.summary.substring(0, 255);
    }
    
    // Create story
    try {
        const response = await axios.post(
            `${process.env.JIRA_BASE_URL}/rest/api/2/issue`,
            storyPayload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.JIRA_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        stories.push({
            key: response.data.key,
            summary: criteria
        });
        
        console.log(`✅ Story created: ${response.data.key} - ${criteria}`);
        
    } catch (error) {
        console.error(`⚠️ Failed to create story for: ${criteria}`);
        console.error(`Error: ${error.message}`);
    }
    
    // Rate limiting: wait 500ms between requests
    await sleep(500);
}

storeVariable('STORY_KEYS', JSON.stringify(stories));
console.log(`✅ Created ${stories.length} user stories`);
```

**Validation Checkpoint 4**: ✅ User stories created (or gracefully handled)

---

### Step 5: Create Confluence Requirements Page (5 minutes)

**5.1 Convert Markdown to Confluence HTML**
```javascript
const confluenceHtml = convertMarkdownToConfluenceHtml(reqContent);

// Ensure proper HTML structure
if (!confluenceHtml.includes('<h1>') && !confluenceHtml.includes('<h2>')) {
    throw new Error('Invalid HTML conversion - no headings found');
}
```

**5.2 Prepare Confluence Payload**
```javascript
const pageTitle = `${title} - Requirements Specification`;
const confluencePayload = {
    type: 'page',
    title: pageTitle,
    space: { key: process.env.CONFLUENCE_SPACE_KEY },
    body: {
        storage: {
            value: confluenceHtml,
            representation: 'storage'
        }
    }
};

// Add Epic link if available
if (epicKey && epicKey !== 'LOCAL-ONLY') {
    confluencePayload.body.storage.value += `
        <p><strong>Jira Epic:</strong> 
        <a href="${process.env.JIRA_BASE_URL}/browse/${epicKey}">${epicKey}</a></p>
    `;
}
```

**5.3 Execute API Call**
```javascript
try {
    const response = await axios.post(
        `${process.env.CONFLUENCE_BASE_URL}/rest/api/content`,
        confluencePayload,
        {
            headers: {
                'Authorization': `Bearer ${process.env.CONFLUENCE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    const pageId = response.data.id;
    const pageUrl = `${process.env.CONFLUENCE_BASE_URL}${response.data._links.webui}`;
    
    console.log(`✅ Confluence page created: ${pageTitle}`);
    console.log(`   URL: ${pageUrl}`);
    
    storeVariable('CONFLUENCE_REQUIREMENTS_PAGE_ID', pageId);
    storeVariable('CONFLUENCE_REQUIREMENTS_PAGE_URL', pageUrl);
    
} catch (error) {
    if (error.response?.status === 401) {
        throw new Error('Confluence authentication failed. Check CONFLUENCE_API_TOKEN');
    } else if (error.response?.status === 400) {
        throw new Error(`Confluence API error: ${JSON.stringify(error.response.data)}`);
    } else {
        console.error('⚠️ Confluence page creation failed, continuing with local files only');
        console.error(`Error: ${error.message}`);
    }
}
```

**Validation Checkpoint 5**: ✅ Confluence page created (or gracefully handled)

---

### Step 6: Log Summary and Handoff (1 minute)

**6.1 Create Summary**
```javascript
const summary = {
    phase: 'Requirements Analysis',
    status: 'COMPLETE',
    timestamp: new Date().toISOString(),
    outputs: {
        requirements_md: 'requirements.md',
        jira_epic: getVariable('EPIC_KEY'),
        jira_stories_count: stories.length,
        confluence_page: getVariable('CONFLUENCE_REQUIREMENTS_PAGE_URL') || 'N/A'
    },
    nextAgent: 'Architect Agent',
    handoffData: {
        epicKey: getVariable('EPIC_KEY'),
        projectName: title,
        acceptanceCriteriaCount: acceptanceCriteria.length
    }
};
```

**6.2 Write Log**
```javascript
appendLog('logs/requirements.log', JSON.stringify(summary, null, 2));
appendLog('logs/orchestration.log', 
    `[${new Date().toISOString()}] [REQUIREMENTS] COMPLETE - Epic: ${getVariable('EPIC_KEY')}`
);
```

**6.3 Display Summary to User**
```
✅ Requirements Analysis Phase Complete!

Generated:
  📄 requirements.md
  🎫 Jira Epic: ${epicKey} (${epicUrl})
  📋 User Stories: ${stories.length} created
  📖 Confluence: ${confluenceUrl}

Next Phase: Architecture Design

Handoff Data:
  - Epic Key: ${epicKey}
  - Project: ${title}
  - Acceptance Criteria: ${acceptanceCriteria.length}
```

**Validation Checkpoint 6**: ✅ Phase complete, handoff ready

---

## Error Handling Procedures

### Error Type 1: File Not Found
```javascript
if (!fileExists('user-story.txt')) {
    logError('user-story.txt not found');
    createJiraBug({
        summary: '[Requirements] user-story.txt not found',
        description: 'Cannot proceed without user story input',
        priority: 'Critical'
    });
    throw new Error('STOP_WORKFLOW: user-story.txt missing');
}
```

### Error Type 2: Jira API Failure
```javascript
catch (error) {
    if (isJiraError(error)) {
        logError(`Jira API failed: ${error.message}`);
        // Continue with local files only
        console.warn('⚠️ Continuing without Jira integration');
        storeVariable('EPIC_KEY', 'LOCAL-ONLY');
        // Do NOT throw - graceful degradation
    }
}
```

### Error Type 3: Invalid User Story Format
```javascript
if (!hasRequiredSections(userStoryContent)) {
    logError('user-story.txt missing required sections');
    createJiraBug({
        summary: '[Requirements] Invalid user story format',
        description: `Missing sections: ${getMissingSections()}`,
        priority: 'High'
    });
    throw new Error('STOP_WORKFLOW: Invalid user story format');
}
```

### Error Type 4: AI Prompt Failure
```javascript
try {
    const result = await executePrompt(prompt);
} catch (error) {
    logError(`Prompt execution failed: ${error.message}`);
    // Retry once
    await sleep(2000);
    try {
        const result = await executePrompt(prompt);
    } catch (retryError) {
        logError('Prompt retry failed');
        createJiraBug({
            summary: '[Requirements] AI prompt execution failed',
            description: `Error: ${retryError.message}`,
            priority: 'Critical'
        });
        throw new Error('STOP_WORKFLOW: Cannot generate requirements');
    }
}
```

---

## Success Criteria (All Must Pass)

- ✅ `requirements.md` file created and contains all mandatory sections
- ✅ Functional Requirements numbered (FR1, FR2, ...)
- ✅ Non-Functional Requirements numbered (NFR1, NFR2, NFR3 minimum)
- ✅ Acceptance Criteria match user story
- ✅ Jira Epic created (or LOCAL-ONLY mode)
- ✅ User Stories created (or LOCAL-ONLY mode)
- ✅ Confluence page created (or gracefully skipped)
- ✅ No Critical errors
- ✅ Summary logged
- ✅ Handoff data prepared

---

## Failure Criteria (Stop Workflow)

- ❌ `user-story.txt` not found or empty
- ❌ User story missing required sections
- ❌ Cannot parse acceptance criteria
- ❌ `requirements.md` generation fails after retry
- ❌ Markdown validation fails
- ❌ Environment variables missing

---

## Output Specification

### File: requirements.md
- **Format**: Markdown
- **Encoding**: UTF-8
- **Max Size**: 50 KB
- **Sections**: 8 mandatory sections
- **Validation**: Must pass markdown linter

### Jira Epic
- **Key Format**: `[PROJECT-KEY]-[NUMBER]` (e.g., EPM-123)
- **Status**: To Do
- **Labels**: agentic-sdlc, auto-generated

### Jira Stories
- **Count**: Equals number of acceptance criteria
- **Parent**: Linked to Epic
- **Status**: To Do

### Confluence Page
- **Title Format**: `[Project Name] - Requirements Specification`
- **Space**: As specified in CONFLUENCE_SPACE_KEY
- **Format**: HTML (Confluence storage format)

---

## Logging Requirements

Log every action to `logs/requirements.log`:
```
[TIMESTAMP] [INFO] Starting Requirements Analysis
[TIMESTAMP] [INFO] User story parsed: 3 acceptance criteria found
[TIMESTAMP] [SUCCESS] requirements.md created
[TIMESTAMP] [SUCCESS] Jira Epic created: EPM-123
[TIMESTAMP] [SUCCESS] Jira Story 1 created: EPM-124
[TIMESTAMP] [SUCCESS] Confluence page created: ID 12345
[TIMESTAMP] [COMPLETE] Phase complete, handing off to Architect
```

---

## Performance Targets

- Total execution time: < 15 minutes
- File generation: < 5 minutes
- Jira operations: < 5 minutes
- Confluence operations: < 3 minutes
- Validation: < 2 minutes

---

## Related Files

- Agent Definition: `.github/copilot/requirements-analyst.md`
- Rules: `.github/copilot/rules/requirements-analyst-rules.md`
- Prompt: `.github/prompts/analyze-requirements.md`
- Knowledge Base: `knowledge-base/jira-confluence-integration.md`
