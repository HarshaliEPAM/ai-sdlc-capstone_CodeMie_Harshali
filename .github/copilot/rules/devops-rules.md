# DevOps Agent - Mandatory Rules

## CRITICAL Rules (Violation = Stop Workflow)

### RULE-DEVOPS-001: Backend Build Success
mvn clean package MUST succeed (exit code 0).
Penalty: STOP_WORKFLOW

### RULE-DEVOPS-002: Frontend Build Success
npm run build MUST succeed (exit code 0).
Penalty: STOP_WORKFLOW

### RULE-DEVOPS-003: Git Branch Naming
Branch name MUST follow: feature/agentic-sdlc-[timestamp].
Penalty: STOP_WORKFLOW

### RULE-DEVOPS-004: GitHub Token Present
GITHUB_TOKEN MUST be set in environment.
Penalty: STOP_WORKFLOW

## HIGH Rules (Violation = Warning + Continue)

### RULE-DEVOPS-101: Commit Message Format
Commit message MUST follow conventional commits format.
Penalty: WARN + auto-fix

### RULE-DEVOPS-102: PR Description Complete
PR MUST include all sections: overview, components, docs, Jira, testing, checklist.
Penalty: WARN

### RULE-DEVOPS-103: All Links Valid
All links in PR MUST be accessible.
Penalty: WARN

## MEDIUM Rules (Violation = Info Log)

### RULE-DEVOPS-201: Build Artifacts Size
JAR file SHOULD be < 100MB, build folder < 50MB.
Penalty: INFO if oversized

### RULE-DEVOPS-202: Local Deployment Accessible
Local backend and frontend SHOULD be accessible.
Penalty: WARN if not accessible

## VALIDATION Rules (Must Pass Before Handoff)

### RULE-DEVOPS-301: No Secrets in Commit
Commits MUST NOT contain secrets, tokens, or credentials.
Penalty: STOP_WORKFLOW + critical error

### RULE-DEVOPS-302: PR Created Successfully
GitHub PR MUST be created and return valid URL.
Penalty: STOP_WORKFLOW

### RULE-DEVOPS-303: Build Warnings
Builds SHOULD have minimal warnings.
Penalty: INFO if warnings present

## SECURITY Rules

### RULE-DEVOPS-401: No Secrets Committed
Git commits MUST NOT contain .env files or secrets.
Penalty: CRITICAL_ERROR + stop push

### RULE-DEVOPS-402: Branch Protection
MUST NOT push directly to main branch.
Penalty: CRITICAL_ERROR

## PERFORMANCE Rules

### RULE-DEVOPS-501: Build Time Limit
Backend build MUST complete in < 5 minutes.
Penalty: WARN if over

### RULE-DEVOPS-502: Frontend Build Time
Frontend build MUST complete in < 3 minutes.
Penalty: WARN if over

## Rule Enforcement
Log all validations to logs/devops-rules.log

## Related Files
- Instructions: .github/copilot/instructions/devops-instructions.md
- Agent: .github/copilot/devops-agent.md
