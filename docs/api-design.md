# API Design

Base path: `/api/tasks`

| Method | Path | Purpose | Success |
|---|---|---|---|
| `POST` | `/api/tasks` | Create a task | `201` with task JSON |
| `GET` | `/api/tasks` | List tasks, newest first | `200` with an array |
| `GET` | `/api/tasks/{id}` | Retrieve one task | `200` with task JSON |
| `DELETE` | `/api/tasks/{id}` | Delete a task | `204` |

Create request:

```json
{"title":"Plan the week","description":"Review priorities"}
```

Titles are required and limited to 3-100 characters. Descriptions are required and limited to 1000 characters. Invalid requests return `400`; an unknown task ID returns `404` with a timestamp, status, and message.
# API Design

## Base URL
`http://localhost:8080/api`

## Task Resource

### `GET /tasks`
Returns all tasks ordered by `createdAt` descending.

Response `200 OK`:
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk and vegetables",
    "createdAt": "2026-09-03T12:00:00",
    "updatedAt": "2026-09-03T12:00:00"
  }
]
```

### `GET /tasks/{id}`
Returns one task. A missing task returns `404 Not Found`.

Response `200 OK`:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk and vegetables",
  "createdAt": "2026-09-03T12:00:00",
  "updatedAt": "2026-09-03T12:00:00"
}
```

### `POST /tasks`
Creates a task. `title` is required and must be 3-100 characters. `description` is required and must be at most 1000 characters.

Request:
```json
{
  "title": "Buy groceries",
  "description": "Milk and vegetables"
}
```

Response `201 Created`: the created task response, including generated `id` and timestamps.

### `DELETE /tasks/{id}`
Deletes an existing task.

Response `204 No Content`: deletion succeeded. A missing task returns `404 Not Found`.

## Error Responses
Validation failures return `400 Bad Request`:
```json
{
  "timestamp": "2026-09-03T12:00:00",
  "status": 400,
  "message": "Validation failed",
  "errors": { "title": "Title must be between 3 and 100 characters" }
}
```

Missing resources return `404 Not Found`:
```json
{
  "timestamp": "2026-09-03T12:00:00",
  "status": 404,
  "message": "Task not found with id: 1"
}
```

## OpenAPI
Swagger UI is available at `/swagger-ui.html`; the OpenAPI JSON document is available at `/api-docs`.