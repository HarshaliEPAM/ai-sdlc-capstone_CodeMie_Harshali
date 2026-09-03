# Generate Frontend Code Prompt

## Purpose
Generate complete React frontend application from architecture specifications.

## Input
- docs/architecture.md
- docs/api-design.md

## Expected Output
- Complete frontend/ directory
- package.json
- All React component files

## Prompt Template

```
You are a Frontend Developer AI agent. Generate a complete React application based on this architecture.

Architecture:
{architecture_content}

API Design:
{api_design_content}

Generate:

1. **package.json**:
   - Dependencies: react, react-dom, axios, react-scripts
   - Scripts: start, build, test
   - Proxy: "http://localhost:8080"

2. **public/index.html**:
   - Standard HTML5 template
   - Root div with id="root"

3. **For each entity/resource**:
   
   a) **Service** (src/services/[resource]Service.js):
      - Import axios
      - Define API_URL
      - Export object with methods:
        - getAll()
        - getById(id)
        - create(data)
        - update(id, data)
        - delete(id)
        - search(query) if needed
   
   b) **List Component** (src/components/[Resource]List.js):
      - useState for data, loading, error
      - useEffect to fetch data
      - Display list of items
      - Loading state
      - Error handling
      - Delete functionality
      - Link to create/edit forms
   
   c) **Form Component** (src/components/[Resource]Form.js):
      - useState for form fields
      - handleChange for inputs
      - handleSubmit for form submission
      - Input validation
      - Error display
      - Success feedback
   
   d) **Item Component** (src/components/[Resource]Item.js):
      - Display single item details
      - Edit/Delete buttons
      - Props validation

4. **App.js**:
   - Import all components
   - useState for current view/routing
   - Render appropriate components
   - Basic styling

5. **App.css**:
   - Simple, clean styles
   - Responsive design
   - Mobile-friendly

6. **index.js**:
   - Import React, ReactDOM
   - Import App and styles
   - Render App

Ensure:
- Functional components with Hooks
- Proper error handling
- Loading states
- User-friendly error messages
- Form validation
- Responsive design
- Clean, readable code
- No console errors

Return as structured JSON:
- files: [{path: string, content: string}, ...]
- package_json: string
```

## Usage Example

```javascript
const prompt = loadPrompt('generate-frontend.md');
const architecture = fs.readFileSync('docs/architecture.md', 'utf-8');
const apiDesign = fs.readFileSync('docs/api-design.md', 'utf-8');
const result = await copilot.execute(prompt
  .replace('{architecture_content}', architecture)
  .replace('{api_design_content}', apiDesign));
```

## Validation Checklist

- ✅ package.json is valid
- ✅ All imports are correct
- ✅ No syntax errors
- ✅ Service layer properly structured
- ✅ Components use Hooks correctly
- ✅ Error handling implemented
- ✅ Loading states implemented

## Knowledge Base References
- docs/coding-standards.md
- knowledge-base/common-patterns.md
