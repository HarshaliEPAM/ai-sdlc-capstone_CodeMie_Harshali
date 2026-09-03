# Architect Agent - Mandatory Rules

## CRITICAL Rules (Violation = Stop Workflow)

### RULE-ARCH-001: Requirements File Validation
requirements.md MUST exist and contain Functional Requirements section.
Penalty: STOP_WORKFLOW

### RULE-ARCH-002: Entity Definition Required
MUST define at least 1 JPA entity with @Entity annotation.
Penalty: STOP_WORKFLOW

### RULE-ARCH-003: Architecture Document Structure
architecture.md MUST contain these sections: System Overview, Technology Stack, Data Models, Database Schema.
Penalty: STOP_WORKFLOW

### RULE-ARCH-004: API Design Completeness
ALL entities MUST have corresponding CRUD endpoints defined.
Penalty: STOP_WORKFLOW

### RULE-ARCH-005: JPA Annotation Validation
ALL entities MUST have @Id with @GeneratedValue.
Penalty: STOP_WORKFLOW

## HIGH Rules (Violation = Warning + Continue)

### RULE-ARCH-101: Entity Relationships
Entities with relationships MUST define @OneToMany, @ManyToOne, or @ManyToMany annotations.
Penalty: WARN

### RULE-ARCH-102: DTO Pattern
DTOs MUST be defined separately from entities.
Penalty: WARN

### RULE-ARCH-103: API Endpoint Naming
API endpoints MUST use /api prefix and lowercase resource names.
Penalty: WARN + auto-fix

### RULE-ARCH-104: Request/Response Examples
ALL API endpoints MUST include JSON request/response examples.
Penalty: WARN

## MEDIUM Rules (Violation = Info Log)

### RULE-ARCH-201: Entity Timestamps
Entities SHOULD include @CreationTimestamp and @UpdateTimestamp fields.
Penalty: INFO

### RULE-ARCH-202: Validation Annotations
Entity fields SHOULD have appropriate Bean Validation annotations.
Penalty: INFO

### RULE-ARCH-203: Database Indexing
Primary access fields SHOULD have index recommendations.
Penalty: INFO

## VALIDATION Rules (Must Pass Before Handoff)

### RULE-ARCH-301: File Output Validation
architecture.md and api-design.md MUST exist and be readable.
Penalty: STOP_WORKFLOW

### RULE-ARCH-302: Entity Syntax Validation
All entity definitions MUST be valid Java syntax.
Penalty: STOP_WORKFLOW

### RULE-ARCH-303: API Specification Completeness
api-design.md MUST document all HTTP methods for each endpoint.
Penalty: STOP_WORKFLOW

## SECURITY Rules

### RULE-ARCH-401: No Hardcoded Credentials
Database configuration MUST use environment variables or properties, never hardcoded values.
Penalty: CRITICAL_ERROR

### RULE-ARCH-402: Input Validation Design
All POST/PUT endpoints MUST specify input validation requirements.
Penalty: WARN

## PERFORMANCE Rules

### RULE-ARCH-501: Database Query Optimization
Entity relationships MUST specify fetch types (LAZY/EAGER) to prevent N+1 queries.
Penalty: WARN

### RULE-ARCH-502: Execution Time Limit
Total execution time MUST NOT exceed 20 minutes.
Penalty: WARN

## Rule Enforcement
- CRITICAL: Stop immediately
- HIGH: Warn + attempt auto-fix
- MEDIUM: Info log
- VALIDATION: Must pass before handoff
- SECURITY: Auto-redact + critical log
- PERFORMANCE: Log for review

## Audit Trail
Log all rule validations to logs/architect-rules.log

## Related Files
- Instructions: .github/copilot/instructions/architect-instructions.md
- Agent: .github/copilot/architect-agent.md
