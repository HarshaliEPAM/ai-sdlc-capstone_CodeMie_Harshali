# Backend Developer Agent - Mandatory Rules

## CRITICAL Rules (Violation = Stop Workflow)

### RULE-DEV-001: Compilation Success
Code MUST compile without errors (mvn clean compile exit code 0).
Penalty: STOP_WORKFLOW

### RULE-DEV-002: Entity Annotation Validation
ALL entity classes MUST have @Entity annotation.
Penalty: STOP_WORKFLOW

### RULE-DEV-003: No Hardcoded Values
NO hardcoded database credentials, URLs, or sensitive data in code.
Penalty: STOP_WORKFLOW

### RULE-DEV-004: Exception Handling Required
GlobalExceptionHandler with @RestControllerAdvice MUST exist.
Penalty: STOP_WORKFLOW

### RULE-DEV-005: Package Declaration
ALL Java files MUST have proper package declarations.
Penalty: STOP_WORKFLOW

## HIGH Rules (Violation = Warning + Continue)

### RULE-DEV-101: Lombok Usage
MUST use Lombok annotations (@Data, @NoArgsConstructor, @AllArgsConstructor) correctly.
Penalty: WARN

### RULE-DEV-102: DTO in Controllers
Controllers MUST use DTOs, NOT entities, in request/response.
Penalty: WARN + create bug

### RULE-DEV-103: Service Interfaces
Service interfaces MUST be defined, implementations MUST implement them.
Penalty: WARN

### RULE-DEV-104: Dependency Injection
MUST use constructor injection with @RequiredArgsConstructor, NOT field injection.
Penalty: WARN

### RULE-DEV-105: Repository Pattern
Repositories MUST extend JpaRepository<Entity, Long>.
Penalty: WARN

## MEDIUM Rules (Violation = Info Log)

### RULE-DEV-201: JavaDoc Comments
Public methods SHOULD have JavaDoc comments.
Penalty: INFO

### RULE-DEV-202: Method Naming
Methods SHOULD follow naming conventions (getById, findAll, create, update, delete).
Penalty: INFO

### RULE-DEV-203: Code Organization
MUST follow package structure: entity, dto, repository, service, controller, exception, config.
Penalty: INFO

## VALIDATION Rules (Must Pass Before Handoff)

### RULE-DEV-301: File Structure Validation
src/ directory MUST contain main and test subdirectories.
Penalty: STOP_WORKFLOW

### RULE-DEV-302: Application Starts
Application MUST start successfully (mvn spring-boot:run).
Penalty: STOP_WORKFLOW

### RULE-DEV-303: No Debug Code
NO System.out.println() or debug statements in production code.
Penalty: WARN + auto-remove

### RULE-DEV-304: pom.xml Validation
pom.xml MUST be valid XML with all required dependencies.
Penalty: STOP_WORKFLOW

## SECURITY Rules

### RULE-DEV-401: Input Validation
ALL POST/PUT endpoints MUST use @Valid annotation.
Penalty: CRITICAL_ERROR

### RULE-DEV-402: SQL Injection Prevention
MUST use JPA/JPQL, NO raw SQL with string concatenation.
Penalty: CRITICAL_ERROR

### RULE-DEV-403: Error Message Safety
Error responses MUST NOT expose stack traces or sensitive data to clients.
Penalty: WARN

## PERFORMANCE Rules

### RULE-DEV-501: No N+1 Queries
Entity relationships MUST use proper fetch strategies to prevent N+1 queries.
Penalty: WARN

### RULE-DEV-502: Build Time Limit
mvn clean package MUST complete in under 5 minutes.
Penalty: INFO

## Rule Enforcement
Log all validations to logs/developer-rules.log

## Related Files
- Instructions: .github/copilot/instructions/developer-instructions.md
- Agent: .github/copilot/developer-agent.md
