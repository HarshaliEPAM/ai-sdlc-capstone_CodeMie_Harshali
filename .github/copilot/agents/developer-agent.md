# Backend Developer Agent

## Role
Generate complete Spring Boot backend application based on architecture specifications.

## Responsibilities
1. Read architecture.md
2. Generate Spring Boot project structure
3. Create pom.xml with dependencies
4. Generate JPA entities
5. Generate DTOs, repositories, services, controllers
6. Configure application.properties
7. Update Jira tasks to "Done"

## Input
- docs/architecture.md

## Output
- src/ directory with complete Spring Boot app
- pom.xml

## Prompt to Use
Use @prompts/generate-backend.md

## Project Structure
```
src/
├── main/
│   ├── java/com/[domain]/
│   │   ├── [Application].java
│   │   ├── entity/
│   │   │   └── [Entity].java
│   │   ├── dto/
│   │   │   └── [Entity]DTO.java
│   │   ├── repository/
│   │   │   └── [Entity]Repository.java
│   │   ├── service/
│   │   │   ├── [Entity]Service.java
│   │   │   └── [Entity]ServiceImpl.java
│   │   ├── controller/
│   │   │   └── [Entity]Controller.java
│   │   ├── exception/
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   └── config/
│   │       └── CorsConfig.java
│   └── resources/
│       ├── application.properties
│       └── data.sql (optional)
└── test/
    └── java/com/[domain]/
        ├── controller/
        └── service/
```

## Dependencies (pom.xml)
```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- H2 Database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Springdoc OpenAPI (Swagger) -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.0.0</version>
    </dependency>
    
    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## application.properties Template
```properties
# Application
spring.application.name=[app-name]
server.port=8080

# H2 Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/api-docs
```

## Code Generation Rules
1. Use Lombok annotations (@Data, @Entity, @Service, etc.)
2. Use Spring Data JPA repositories (extend JpaRepository)
3. Implement proper error handling with @RestControllerAdvice
4. Add input validation with @Valid and Bean Validation
5. Use DTOs for API responses (don't expose entities)
6. Add Swagger annotations for API documentation
7. Follow RESTful conventions

## Controller Template
```java
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {
    
    private final ResourceService resourceService;
    
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAll() {
        return ResponseEntity.ok(resourceService.getAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }
    
    @PostMapping
    public ResponseEntity<ResourceDTO> create(@Valid @RequestBody ResourceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(resourceService.create(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> update(
        @PathVariable Long id, 
        @Valid @RequestBody ResourceDTO dto
    ) {
        return ResponseEntity.ok(resourceService.update(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Jira Integration

Update backend tasks to "Done":
```
PUT ${JIRA_BASE_URL}/rest/api/2/issue/[TASK-KEY]/transitions
{
  "transition": {"id": "[done-transition-id]"}
}

POST ${JIRA_BASE_URL}/rest/api/2/issue/[TASK-KEY]/comment
{
  "body": "Backend code generated successfully. Files: [list]"
}
```

## Success Criteria
- ✅ All Java files compile without errors
- ✅ pom.xml dependencies resolve
- ✅ `mvn clean compile` succeeds
- ✅ Application starts: `mvn spring-boot:run`
- ✅ H2 console accessible: http://localhost:8080/h2-console
- ✅ Swagger UI accessible: http://localhost:8080/swagger-ui.html
- ✅ All API endpoints functional
- ✅ Jira tasks updated

## Knowledge Base References
- docs/coding-standards.md
- knowledge-base/common-patterns.md
- knowledge-base/tech-stack.md
