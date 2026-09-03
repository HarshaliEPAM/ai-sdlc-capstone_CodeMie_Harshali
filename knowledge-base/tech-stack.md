# Technology Stack - Agentic SDLC Framework

## Backend Stack

### Core Framework
- **Spring Boot**: 3.1+
- **Java Version**: 17 (LTS)
- **Build Tool**: Apache Maven 3.9+

### Dependencies

#### Web & API
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
- RESTful API development
- Embedded Tomcat server
- JSON serialization/deserialization

#### Data Access
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
- Spring Data JPA
- Hibernate ORM
- Repository pattern support

#### Database
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```
- H2 in-memory database
- Perfect for development and testing
- Web console for data inspection

#### Development Tools
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```
- Reduces boilerplate code
- @Data, @Getter, @Setter, @Builder annotations
- @Slf4j for logging

#### Validation
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```
- Bean Validation (JSR-380)
- @NotNull, @NotBlank, @Size, @Email, etc.
- Automatic validation in controllers with @Valid

#### API Documentation
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.0</version>
</dependency>
```
- OpenAPI 3.0 specification
- Swagger UI integration
- Automatic API documentation

#### Testing
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```
- JUnit 5 (Jupiter)
- Mockito for mocking
- Spring Test for integration tests
- MockMvc for controller testing

---

## Frontend Stack

### Core Framework
- **React**: 18.2+
- **Node.js**: 18+ (LTS)
- **Package Manager**: npm 9+

### Dependencies

#### React Core
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```
- Component-based architecture
- Virtual DOM for performance
- Hooks API (useState, useEffect, etc.)

#### HTTP Client
```json
{
  "axios": "^1.6.0"
}
```
- Promise-based HTTP client
- Request/response interceptors
- Automatic JSON transformation
- Browser and Node.js support

#### Build Tools
```json
{
  "react-scripts": "5.0.1"
}
```
- Create React App tooling
- Webpack bundler
- Babel transpiler
- Development server with hot reload

#### Testing
```json
{
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^5.16.5",
  "@testing-library/user-event": "^13.5.0"
}
```
- React Testing Library
- Jest test runner
- DOM testing utilities
- User event simulation

---

## Development Tools

### Version Control
- **Git**: 2.x+
- **GitHub**: For repository hosting
- **GitHub API**: For PR automation

### IDEs & Editors
- **VS Code** (Recommended)
  - GitHub Copilot extension
  - Java Extension Pack
  - ES7+ React snippets
- **IntelliJ IDEA** (Alternative)
- **Eclipse** (Alternative)

### Required Tools
- **Java JDK**: 17+
- **Maven**: 3.9+
- **Node.js**: 18+
- **npm**: 9+
- **Git**: 2.x+

---

## Integration Tools

### Jira
- **Base URL**: https://jiraeu.epam.com
- **API Version**: REST API v2
- **Authentication**: Bearer token
- **Usage**: Epic and task management

### Confluence
- **Base URL**: https://confluence.epam.com
- **API Version**: REST API
- **Authentication**: Bearer token
- **Usage**: Documentation hosting

### GitHub
- **API Version**: REST API v3
- **Authentication**: Personal Access Token
- **Usage**: PR creation, repository management

---

## Architecture Patterns

### Backend Patterns
- **Layered Architecture**:
  - Controller Layer (REST endpoints)
  - Service Layer (Business logic)
  - Repository Layer (Data access)
- **Dependency Injection**: Constructor injection with Lombok
- **DTO Pattern**: Separate DTOs from entities
- **Repository Pattern**: Spring Data JPA repositories
- **Exception Handling**: Global exception handler with @RestControllerAdvice

### Frontend Patterns
- **Component-Based**: Functional components
- **Hooks Pattern**: useState, useEffect, custom hooks
- **Service Layer**: Separate API calls from components
- **Container/Presentational**: Smart and dumb components
- **Error Boundaries**: Catch and handle React errors

---

## API Design

### RESTful Conventions
```
GET    /api/{resource}           # List all
GET    /api/{resource}/{id}      # Get one
POST   /api/{resource}           # Create
PUT    /api/{resource}/{id}      # Update
DELETE /api/{resource}/{id}      # Delete
GET    /api/{resource}/search    # Search
```

### HTTP Status Codes
- **200 OK**: Successful GET, PUT
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation errors
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

### Response Format
```json
{
  "id": 1,
  "field": "value",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Error Format
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/resources"
}
```

---

## Database Configuration

### H2 Database
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

### JPA Configuration
```properties
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

---

## Testing Strategy

### Backend Testing
- **Unit Tests**: Service layer with Mockito
- **Integration Tests**: Controller layer with MockMvc
- **Repository Tests**: @DataJpaTest
- **Coverage Target**: 80%+

### Frontend Testing
- **Component Tests**: React Testing Library
- **Integration Tests**: Full user flows
- **Mock API**: jest.mock() for services
- **Coverage Target**: 70%+

---

## Why These Technologies?

### Spring Boot
- ✅ Production-ready out of the box
- ✅ Large ecosystem and community
- ✅ Easy dependency management
- ✅ Excellent documentation
- ✅ Enterprise-grade features

### React
- ✅ Component reusability
- ✅ Virtual DOM performance
- ✅ Large ecosystem
- ✅ Easy to learn and use
- ✅ Strong community support

### H2 Database
- ✅ Zero configuration
- ✅ In-memory for fast testing
- ✅ SQL support
- ✅ Web console for debugging
- ✅ Easy migration to production DB

---

## Version Compatibility Matrix

| Tool | Version | Verified |
|------|---------|----------|
| Java | 17.0.20.1 | ✅ |
| Maven | 3.9.6 | ✅ |
| Node.js | 24.18.0 | ✅ |
| npm | 11.16.0 | ✅ |
| Spring Boot | 3.1+ | ✅ |
| React | 18.2.0 | ✅ |
| Git | 2.55.0 | ✅ |

---

## Production Considerations

When moving to production, consider:
- Replace H2 with PostgreSQL/MySQL
- Add Spring Security for authentication
- Use environment-specific configurations
- Add logging with SLF4J/Logback
- Implement caching with Redis
- Add monitoring with Spring Actuator
- Use Docker for containerization
- Add CI/CD pipelines

---

## Related Documentation
- docs/coding-standards.md
- knowledge-base/common-patterns.md
- docs/api-design.md
