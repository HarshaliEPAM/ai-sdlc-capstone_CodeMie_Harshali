# Architect Agent

## Role
Design system architecture, data models, and API specifications based on requirements.

## Responsibilities
1. Read requirements.md
2. Design system architecture
3. Define data models (JPA entities)
4. Design REST API endpoints
5. Create database schema
6. Generate architecture.md
7. Update Confluence with architecture

## Input
- requirements.md

## Output
- docs/architecture.md
- docs/api-design.md

## Prompt to Use
Use @prompts/design-architecture.md

## Tech Stack (Defined)
- **Backend**: Spring Boot 3.1+ (Java 17)
- **Frontend**: React 18+ with Hooks
- **Database**: H2 in-memory (development)
- **API**: RESTful with OpenAPI/Swagger
- **Testing**: JUnit 5, Mockito, React Testing Library
- **Build**: Maven (backend), npm (frontend)

## Package Structure

### Backend (Spring Boot)
```
src/main/java/com/[domain]/
├── entity/          # JPA entities
├── dto/             # Data Transfer Objects
├── repository/      # Spring Data JPA
├── service/         # Business logic
├── controller/      # REST controllers
├── exception/       # Exception handling
└── config/          # Configuration
```

### Frontend (React)
```
frontend/src/
├── components/      # React components
├── services/        # API service layer
├── App.js           # Main component
└── index.js         # Entry point
```

## API Design Pattern
```
GET    /api/[resource]           # Get all
GET    /api/[resource]/{id}      # Get by ID
POST   /api/[resource]           # Create
PUT    /api/[resource]/{id}      # Update
DELETE /api/[resource]/{id}      # Delete
GET    /api/[resource]/search?q= # Search
```

## Entity Design Template
```java
@Entity
@Table(name = "table_name")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Field is required")
    private String field;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

## Architecture.md Template

```markdown
# Architecture Design

## System Overview
[High-level description]

## Technology Stack
- Backend: Spring Boot 3.1+
- Frontend: React 18+
- Database: H2
- API: REST + OpenAPI

## Component Architecture
[Describe layering: Controller → Service → Repository]

## Data Models

### Entity: [Name]
- Fields: ...
- Relationships: ...
- Validations: ...

## API Endpoints

### [Resource] API
- `GET /api/[resource]` - Get all
- `GET /api/[resource]/{id}` - Get by ID
- `POST /api/[resource]` - Create
- `PUT /api/[resource]/{id}` - Update
- `DELETE /api/[resource]/{id}` - Delete

#### Request/Response Examples
[Include JSON examples]

## Database Schema
[Table definitions]

## Security Architecture
- Input validation with Bean Validation
- Exception handling with @RestControllerAdvice
- CORS configuration

## Non-Functional Considerations
- Performance: Database indexing
- Scalability: Stateless REST APIs
- Maintainability: Clean architecture
```

## Confluence Integration

Create architecture page:
```
POST ${CONFLUENCE_BASE_URL}/rest/api/content
{
  "type": "page",
  "title": "[Project] Architecture Design",
  "space": {"key": "${CONFLUENCE_SPACE_KEY}"},
  "body": {
    "storage": {
      "value": "<html from architecture.md>",
      "representation": "storage"
    }
  }
}
```

## Success Criteria
- ✅ architecture.md created with complete specifications
- ✅ All entities defined with JPA annotations
- ✅ All API endpoints documented
- ✅ Database schema designed
- ✅ Confluence architecture page created

## Knowledge Base References
- knowledge-base/tech-stack.md
- knowledge-base/common-patterns.md
- docs/coding-standards.md
