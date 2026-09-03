# Design Architecture Prompt

## Purpose
Design system architecture, data models, and API specifications based on requirements.

## Input
- requirements.md content

## Expected Output
- docs/architecture.md
- docs/api-design.md
- Confluence architecture page content

## Prompt Template

```
You are an Architect AI agent. Design a complete system architecture based on these requirements.

Requirements:
{requirements_content}

Design:

1. **System Architecture**:
   - Use Spring Boot 3.1+ (Java 17) for backend
   - Use React 18+ with Hooks for frontend
   - Use H2 in-memory database
   - RESTful API design
   - Layered architecture: Controller → Service → Repository

2. **Data Models**:
   For each entity in requirements:
   - Define JPA entity with annotations
   - Include fields with proper types
   - Add validation annotations (@NotBlank, @Size, etc.)
   - Include @CreationTimestamp and @UpdateTimestamp
   - Define relationships if any

3. **API Endpoints**:
   For each entity, design:
   - GET /api/{resource} - Get all
   - GET /api/{resource}/{id} - Get by ID
   - POST /api/{resource} - Create
   - PUT /api/{resource}/{id} - Update
   - DELETE /api/{resource}/{id} - Delete
   - GET /api/{resource}/search?q= - Search (if needed)

   Include:
   - Request/Response JSON examples
   - HTTP status codes
   - Error responses

4. **Package Structure**:
   ```
   src/main/java/com/{domain}/
   ├── entity/
   ├── dto/
   ├── repository/
   ├── service/
   ├── controller/
   ├── exception/
   └── config/
   ```

5. **Frontend Structure**:
   ```
   frontend/src/
   ├── components/
   ├── services/
   ├── App.js
   └── index.js
   ```

Generate:
- **architecture.md**: Complete architecture document
- **api-design.md**: Detailed API specifications
- **confluence_html**: HTML version for Confluence

Ensure:
- All entities have proper JPA annotations
- All endpoints follow RESTful conventions
- DTOs are defined for API responses
- Security considerations documented
- Performance considerations documented

Return as structured JSON:
- architecture_md: string
- api_design_md: string
- entities: array of entity definitions
- endpoints: array of endpoint specifications
- confluence_html: string
```

## Usage Example

```javascript
const prompt = loadPrompt('design-architecture.md');
const requirements = fs.readFileSync('requirements.md', 'utf-8');
const result = await copilot.execute(prompt.replace('{requirements_content}', requirements));
```

## Validation Checklist

- ✅ All entities have @Entity annotation
- ✅ All fields have proper validation
- ✅ All API endpoints documented
- ✅ Request/Response examples included
- ✅ Package structure defined
- ✅ Frontend structure defined

## Knowledge Base References
- knowledge-base/tech-stack.md
- knowledge-base/common-patterns.md
- docs/api-design.md
- docs/coding-standards.md
