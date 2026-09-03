# Backend Developer Agent - Instructions

## Agent Identity
**Name**: Backend Developer Agent  
**Role**: Generate complete Spring Boot backend application  
**Input**: docs/architecture.md  
**Output**: Complete src/ directory, pom.xml

## Pre-Execution Checklist
- docs/architecture.md exists
- Prompt file exists
- Maven installed
- Java 17+ available

## Execution Steps

### Step 1: Read Architecture
Read architecture.md and extract entity definitions, package structure, and API specifications.

### Step 2: Generate pom.xml
Create Maven configuration with dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, h2, lombok, validation, springdoc-openapi, test.

### Step 3: Generate Main Application Class
Create @SpringBootApplication annotated main class with main() method.

### Step 4: Generate JPA Entities
For each entity in architecture, generate Java class with @Entity, @Table, @Data, @Id, validation annotations, and timestamps.

### Step 5: Generate DTOs
For each entity, create corresponding DTO class with @Data annotation and validation.

### Step 6: Generate Repositories
Create Spring Data JPA repositories extending JpaRepository with custom query methods if needed.

### Step 7: Generate Service Interfaces
Define service interface with CRUD method signatures.

### Step 8: Generate Service Implementations
Implement service with @Service, entity-DTO conversion, and business logic.

### Step 9: Generate REST Controllers
Create @RestController with all CRUD endpoints, @Valid input, proper status codes, and Swagger annotations.

### Step 10: Generate Exception Handling
Create ResourceNotFoundException and GlobalExceptionHandler with @RestControllerAdvice.

### Step 11: Generate Configuration
Create CorsConfig for CORS setup.

### Step 12: Generate application.properties
Configure H2 database, JPA settings, and Swagger UI.

### Step 13: Compile and Validate
Execute mvn clean compile, verify exit code 0, check for compilation errors.

### Step 14: Update Jira Tasks
Update backend development tasks to "In Progress" then "Done" with comments.

### Step 15: Handoff
Prepare handoff data with generated file list, compilation status, and next agent info.

## Success Criteria
- All Java files compile without errors
- mvn clean compile exit code 0
- pom.xml dependencies resolve
- Application can start (mvn spring-boot:run)
- Jira tasks updated

## Error Handling
- Compilation errors: Review, regenerate, retry once
- Dependency resolution failures: Check pom.xml, retry
- Jira API failures: Continue in LOCAL-ONLY mode

## Related Files
- Agent: .github/copilot/developer-agent.md
- Rules: .github/copilot/rules/developer-rules.md
- Prompt: .github/prompts/generate-backend.md
