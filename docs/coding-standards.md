# Coding Standards - Agentic SDLC Framework

## Overview
These coding standards ensure consistency, maintainability, and quality across all generated code.

---

## General Principles

### 1. Code Should Be Self-Documenting
- Use meaningful variable and method names
- Avoid cryptic abbreviations
- Write code that explains its intent

### 2. Don't Repeat Yourself (DRY)
- Extract common logic into reusable methods
- Use inheritance and composition appropriately
- Avoid copy-paste code

### 3. Keep It Simple (KISS)
- Prefer simple solutions over complex ones
- Don't over-engineer
- Write code that others can understand

### 4. SOLID Principles
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

---

## Java / Spring Boot Standards

### Naming Conventions

#### Classes
```java
// PascalCase for classes
public class TaskController {}
public class UserService {}
public class BookRepository {}
```

#### Methods
```java
// camelCase for methods
public Task createTask() {}
public List<Task> getAllTasks() {}
public void deleteTask(Long id) {}
```

#### Variables
```java
// camelCase for variables
private String taskTitle;
private LocalDateTime createdAt;
private boolean isCompleted;
```

#### Constants
```java
// UPPER_SNAKE_CASE for constants
public static final String API_VERSION = "v1";
public static final int MAX_PAGE_SIZE = 100;
```

### Package Structure
```
com.domain.application
├── entity        # JPA entities
├── dto           # Data Transfer Objects
├── repository    # Spring Data repositories
├── service       # Business logic (interfaces)
│   └── impl      # Service implementations
├── controller    # REST controllers
├── exception     # Custom exceptions
└── config        # Configuration classes
```

### Annotations

#### Use Lombok Appropriately
```java
// ✅ Good
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}

// ❌ Avoid @Data on entities with relationships (can cause recursion)
```

#### Controller Annotations
```java
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    
    private final TaskService taskService;
    
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAll() {}
    
    @PostMapping
    public ResponseEntity<TaskDTO> create(@Valid @RequestBody TaskDTO dto) {}
}
```

#### Validation Annotations
```java
public class TaskDTO {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @Email(message = "Email must be valid")
    private String userEmail;
}
```

### Exception Handling

#### Custom Exceptions
```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

#### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        // Handle validation errors
    }
}
```

### Repository Pattern
```java
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Spring Data JPA provides basic CRUD
    
    // Custom query methods
    List<Task> findByCompleted(boolean completed);
    List<Task> findByTitleContainingIgnoreCase(String title);
    
    // Custom JPQL queries
    @Query("SELECT t FROM Task t WHERE t.createdAt > :date")
    List<Task> findRecentTasks(@Param("date") LocalDateTime date);
}
```

### Service Layer
```java
// Interface
public interface TaskService {
    TaskDTO create(TaskDTO dto);
    TaskDTO getById(Long id);
    List<TaskDTO> getAll();
    TaskDTO update(Long id, TaskDTO dto);
    void delete(Long id);
}

// Implementation
@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {
    
    private final TaskRepository taskRepository;
    
    @Override
    public TaskDTO create(TaskDTO dto) {
        log.info("Creating new task: {}", dto.getTitle());
        Task task = convertToEntity(dto);
        Task saved = taskRepository.save(task);
        return convertToDTO(saved);
    }
    
    private Task convertToEntity(TaskDTO dto) {
        // Conversion logic
    }
    
    private TaskDTO convertToDTO(Task entity) {
        // Conversion logic
    }
}
```

### Testing Standards

#### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    
    @Mock
    private TaskRepository taskRepository;
    
    @InjectMocks
    private TaskServiceImpl taskService;
    
    @Test
    void testCreate_Success() {
        // Arrange
        TaskDTO dto = new TaskDTO();
        dto.setTitle("Test Task");
        
        Task task = new Task();
        task.setId(1L);
        task.setTitle("Test Task");
        
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        
        // Act
        TaskDTO result = taskService.create(dto);
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }
}
```

#### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private TaskService taskService;
    
    @Test
    void testGetAll() throws Exception {
        List<TaskDTO> tasks = Arrays.asList(new TaskDTO());
        when(taskService.getAll()).thenReturn(tasks);
        
        mockMvc.perform(get("/api/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }
}
```

---

## React / JavaScript Standards

### Naming Conventions

#### Components
```javascript
// PascalCase for components
function TaskList() {}
function TaskForm() {}
function TaskItem() {}
```

#### Functions and Variables
```javascript
// camelCase for functions and variables
const fetchTasks = async () => {};
const [tasks, setTasks] = useState([]);
const isLoading = true;
```

#### Constants
```javascript
// UPPER_SNAKE_CASE for constants
const API_BASE_URL = '/api';
const MAX_TASKS = 100;
```

### Component Structure

#### Functional Components with Hooks
```javascript
import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';

function TaskList() {
  // State declarations at top
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effects after state
  useEffect(() => {
    fetchTasks();
  }, []);

  // Helper functions
  const fetchTasks = async () => {
    try {
      const response = await taskService.getAll();
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await taskService.delete(id);
        fetchTasks();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Render logic at end
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onDelete={handleDelete} 
        />
      ))}
    </div>
  );
}

export default TaskList;
```

### Service Layer
```javascript
// src/services/taskService.js
import axios from 'axios';

const API_URL = '/api/tasks';

const taskService = {
  getAll: () => axios.get(API_URL),
  
  getById: (id) => axios.get(`${API_URL}/${id}`),
  
  create: (data) => axios.post(API_URL, data),
  
  update: (id, data) => axios.put(`${API_URL}/${id}`, data),
  
  delete: (id) => axios.delete(`${API_URL}/${id}`),
};

export default taskService;
```

### Error Handling
```javascript
// ✅ Good: Consistent error handling
try {
  const response = await taskService.create(data);
  setTasks([...tasks, response.data]);
  setError(null);
} catch (err) {
  setError(err.response?.data?.message || 'An error occurred');
}

// ❌ Bad: Silent failures
try {
  await taskService.create(data);
} catch (err) {
  // No error handling
}
```

### Testing Standards
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskList from './TaskList';
import taskService from '../services/taskService';

jest.mock('../services/taskService');

test('renders task list', async () => {
  taskService.getAll.mockResolvedValue({
    data: [{ id: 1, title: 'Test Task', completed: false }]
  });
  
  render(<TaskList />);
  
  await waitFor(() => {
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});

test('deletes task', async () => {
  taskService.getAll.mockResolvedValue({ data: [{ id: 1, title: 'Test' }] });
  taskService.delete.mockResolvedValue({});
  
  render(<TaskList />);
  
  const deleteButton = await screen.findByText('Delete');
  fireEvent.click(deleteButton);
  
  await waitFor(() => {
    expect(taskService.delete).toHaveBeenCalledWith(1);
  });
});
```

---

## Documentation Standards

### JavaDoc
```java
/**
 * Creates a new task.
 *
 * @param dto the task data transfer object
 * @return the created task DTO
 * @throws IllegalArgumentException if dto is invalid
 */
public TaskDTO create(TaskDTO dto) {
    // Implementation
}
```

### JSDoc
```javascript
/**
 * Fetches all tasks from the API.
 * @returns {Promise<Array>} Array of task objects
 * @throws {Error} If the API request fails
 */
const fetchTasks = async () => {
  // Implementation
};
```

---

## Git Commit Messages

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(backend): Add task search endpoint

Implement GET /api/tasks/search with query parameter support.
Includes unit tests and integration tests.

Closes EPM-123

---

fix(frontend): Fix task deletion confirmation

Add missing confirmation dialog before deleting tasks.

---

test(backend): Increase test coverage for TaskService

Add tests for edge cases and error scenarios.
Coverage increased from 75% to 85%.
```

---

## Code Review Checklist

### Before Submitting Code
- [ ] Code compiles/runs without errors
- [ ] All tests pass
- [ ] Code follows naming conventions
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Documentation updated
- [ ] No console.log() or System.out.println() in production code

### During Code Review
- [ ] Code is readable and maintainable
- [ ] No code duplication
- [ ] Proper use of design patterns
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Tests cover critical paths

---

## Related Documentation
- knowledge-base/tech-stack.md
- knowledge-base/common-patterns.md
- docs/testing-guidelines.md
