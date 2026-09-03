# Generate Backend Code Prompt

## Purpose
Generate complete Spring Boot backend application from architecture specifications.

## Input
- docs/architecture.md

## Expected Output
- Complete src/ directory structure
- pom.xml with dependencies
- All Java source files

## Prompt Template

```
You are a Backend Developer AI agent. Generate a complete Spring Boot application based on this architecture.

Architecture:
{architecture_content}

Generate:

1. **pom.xml** with dependencies:
   - spring-boot-starter-web
   - spring-boot-starter-data-jpa
   - h2database
   - lombok
   - spring-boot-starter-validation
   - springdoc-openapi-starter-webmvc-ui
   - spring-boot-starter-test

2. **Application Main Class**:
   - @SpringBootApplication annotation
   - main() method

3. **For each entity**:
   
   a) **Entity** (src/main/java/.../entity/):
      - @Entity, @Table annotations
      - @Data, @NoArgsConstructor, @AllArgsConstructor (Lombok)
      - @Id, @GeneratedValue
      - Validation annotations
      - @CreationTimestamp, @UpdateTimestamp
   
   b) **DTO** (src/main/java/.../dto/):
      - @Data (Lombok)
      - All fields from entity (except timestamps if not needed)
      - Validation annotations
   
   c) **Repository** (src/main/java/.../repository/):
      - Extend JpaRepository<Entity, Long>
      - Add custom query methods if needed
   
   d) **Service Interface** (src/main/java/.../service/):
      - CRUD method signatures
      - Business logic methods
   
   e) **Service Implementation** (src/main/java/.../service/):
      - @Service annotation
      - @RequiredArgsConstructor (Lombok)
      - Implement all CRUD operations
      - Entity ↔ DTO conversion
      - Business logic implementation
   
   f) **Controller** (src/main/java/.../controller/):
      - @RestController, @RequestMapping
      - @RequiredArgsConstructor
      - All CRUD endpoints
      - @Valid for input validation
      - Proper HTTP status codes
      - Swagger annotations

4. **Exception Handling**:
   - ResourceNotFoundException.java
   - GlobalExceptionHandler.java with @RestControllerAdvice

5. **Configuration**:
   - CorsConfig.java for CORS setup

6. **application.properties**:
   - H2 configuration
   - JPA settings
   - Swagger settings

Ensure:
- All code compiles without errors
- Proper use of Lombok annotations
- DTOs used in controllers (not entities)
- Proper exception handling
- Input validation
- RESTful conventions followed
- Swagger documentation included

Return as structured JSON:
- files: [{path: string, content: string}, ...]
- pom_xml: string
```

## Usage Example

```javascript
const prompt = loadPrompt('generate-backend.md');
const architecture = fs.readFileSync('docs/architecture.md', 'utf-8');
const result = await copilot.execute(prompt.replace('{architecture_content}', architecture));
```

## Validation Checklist

- ✅ All Java files have proper package declarations
- ✅ No compilation errors
- ✅ pom.xml is valid
- ✅ application.properties configured
- ✅ All entities have repositories
- ✅ All services have implementations
- ✅ All controllers have proper mappings

## Knowledge Base References
- docs/coding-standards.md
- knowledge-base/common-patterns.md
- knowledge-base/tech-stack.md
