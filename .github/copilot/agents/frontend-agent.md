# Frontend Developer Agent

## Role
Generate complete React frontend application based on architecture specifications.

## Responsibilities
1. Read architecture.md
2. Generate React project structure
3. Create package.json
4. Generate service layer for API calls
5. Generate React components
6. Implement CRUD operations
7. Update Jira tasks to "Done"

## Input
- docs/architecture.md
- Backend API endpoints

## Output
- frontend/ directory with complete React app
- frontend/package.json

## Prompt to Use
Use @prompts/generate-frontend.md

## Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── [Entity]List.js
│   │   ├── [Entity]Form.js
│   │   └── [Entity]Item.js
│   ├── services/
│   │   └── [entity]Service.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Dependencies (package.json)
```json
{
  "name": "[app-name]-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:8080"
}
```

## Service Layer Template
```javascript
// src/services/resourceService.js
import axios from 'axios';

const API_URL = '/api/resources';

const resourceService = {
  getAll: () => axios.get(API_URL),
  
  getById: (id) => axios.get(`${API_URL}/${id}`),
  
  create: (data) => axios.post(API_URL, data),
  
  update: (id, data) => axios.put(`${API_URL}/${id}`, data),
  
  delete: (id) => axios.delete(`${API_URL}/${id}`),
  
  search: (query) => axios.get(`${API_URL}/search?q=${query}`)
};

export default resourceService;
```

## Component Pattern (Functional with Hooks)
```javascript
import React, { useState, useEffect } from 'react';
import resourceService from '../services/resourceService';

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAll();
      setResources(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await resourceService.delete(id);
        fetchResources();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="resource-list">
      <h2>Resources</h2>
      {resources.map(resource => (
        <div key={resource.id} className="resource-item">
          <h3>{resource.name}</h3>
          <button onClick={() => handleDelete(resource.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default ResourceList;
```

## UI Requirements
1. Clean, responsive design (mobile-friendly)
2. Loading states with spinner
3. Error handling with user-friendly messages
4. Form validation before submit
5. Success/error notifications
6. Confirmation dialogs for delete operations

## Styling Approach
- Use CSS modules or inline styles
- Keep it simple and clean
- Focus on functionality over fancy design
- Ensure mobile responsiveness

## Integration with Backend
- Use proxy in package.json: `"proxy": "http://localhost:8080"`
- All API calls go through service layer
- Handle CORS properly
- Display meaningful error messages

## Jira Integration

Update frontend tasks to "Done":
```
PUT ${JIRA_BASE_URL}/rest/api/2/issue/[TASK-KEY]/transitions
{
  "transition": {"id": "[done-transition-id]"}
}

POST ${JIRA_BASE_URL}/rest/api/2/issue/[TASK-KEY]/comment
{
  "body": "Frontend components generated: [list]"
}
```

## Success Criteria
- ✅ `npm install` runs without errors
- ✅ `npm start` launches app on http://localhost:3000
- ✅ All components render without errors
- ✅ API calls successfully reach backend
- ✅ CRUD operations work end-to-end
- ✅ UI is responsive
- ✅ No console errors
- ✅ Jira tasks updated

## Knowledge Base References
- docs/coding-standards.md
- knowledge-base/common-patterns.md
