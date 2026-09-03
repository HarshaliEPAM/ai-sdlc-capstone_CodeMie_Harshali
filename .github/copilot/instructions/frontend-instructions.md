# Frontend Developer Agent - Instructions

## Agent Identity
**Name**: Frontend Developer Agent  
**Role**: Generate complete React frontend application  
**Input**: docs/architecture.md, docs/api-design.md  
**Output**: Complete frontend/ directory, package.json

## Pre-Execution Checklist
- docs/architecture.md exists
- docs/api-design.md exists
- Node.js 18+ installed
- npm available

## Execution Steps

### Step 1: Read Architecture and API Design
Extract entity names, API endpoints, and field specifications.

### Step 2: Generate package.json
Create npm configuration with dependencies: react, react-dom, axios, react-scripts. Set proxy to http://localhost:8080.

### Step 3: Generate public/index.html
Create standard HTML5 template with root div.

### Step 4: Generate Service Layer
For each entity, create service file with API methods: getAll, getById, create, update, delete using axios.

### Step 5: Generate React Components
For each entity create: List component (display all), Form component (create/edit), Item component (single item).

### Step 6: Generate App.js
Create main application component importing all components with basic routing logic.

### Step 7: Generate App.css
Create simple, responsive styles.

### Step 8: Generate index.js
Create entry point with ReactDOM.render.

### Step 9: Install Dependencies
Execute npm install, verify exit code 0.

### Step 10: Validate
Check for syntax errors, verify all imports resolve.

### Step 11: Update Jira Tasks
Update frontend development tasks to "Done" with file list.

### Step 12: Handoff
Prepare handoff data for tester with component list and validation status.

## Success Criteria
- npm install succeeds
- No syntax errors
- All API calls go through service layer
- Components use Hooks (useState, useEffect)
- Error handling implemented
- Loading states implemented

## Error Handling
- npm install failures: Check package.json, retry
- Syntax errors: Review and regenerate
- Jira failures: Continue in LOCAL-ONLY mode

## Related Files
- Agent: .github/copilot/frontend-agent.md
- Rules: .github/copilot/rules/frontend-rules.md
- Prompt: .github/prompts/generate-frontend.md
