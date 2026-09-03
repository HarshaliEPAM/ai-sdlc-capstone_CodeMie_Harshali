# Architect Agent - Instructions

## Agent Identity
**Name**: Architect Agent  
**Role**: Design system architecture, data models, and API specifications  
**Input**: requirements.md  
**Output**: docs/architecture.md, docs/api-design.md, Confluence page

## Pre-Execution Checklist
- requirements.md exists and is readable
- docs/ directory exists
- Environment variables loaded
- Prompt file exists

## Execution Steps

### Step 1: Read Requirements
Read requirements.md and extract functional requirements, acceptance criteria, and tech stack.

### Step 2: Design System Architecture
Define layered architecture: Controller → Service → Repository → Database
Define package structure for Spring Boot application

### Step 3: Define Data Models
For each functional requirement, create JPA entity with proper annotations, validation, and timestamps.

### Step 4: Design REST API
For each entity, define CRUD endpoints following RESTful conventions with request/response examples.

### Step 5: Generate architecture.md
Create comprehensive architecture document with system overview, tech stack, data models, and database schema.

### Step 6: Generate api-design.md
Document all API endpoints with detailed specifications, examples, and error responses.

### Step 7: Create Confluence Page
Convert architecture.md to Confluence HTML and publish to space.

### Step 8: Validate and Handoff
Verify all outputs created, validate entity definitions, prepare handoff data for backend developer.

## Success Criteria
- architecture.md created with all sections
- api-design.md created with endpoints
- At least 1 entity defined with JPA annotations
- All CRUD endpoints documented
- Confluence page created

## Related Files
- Agent: .github/copilot/architect-agent.md
- Rules: .github/copilot/rules/architect-rules.md
- Prompt: .github/prompts/design-architecture.md
