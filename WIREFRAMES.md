# Wireframes - Task Manager (Frontend)

This document captures low-fidelity wireframes (ASCII) and navigation flows for the frontend app found in `src/frontend` on the `develop` branch.

---

## 1) App sitemap / Routing

Routes from `src/frontend/src/App.jsx`:

- `/login` -> **LoginPage**
- `/register` -> **RegisterPage**
- `/dashboard` -> **DashboardPage** (**PrivateRoute**, requires `user` in AuthContext)
- `*` -> redirect -> `/login`

Auth guard behavior:
- If user is not authenticated, access to `/dashboard` redirects to `/login`
- Logout (via Navbar) clears auth state and navigates to `/login`

---

## 2) Navigation / Header (Navbar)

Component: `src/frontend/src/components/Navbar.jsx`

Primary elements:
- AppBar/Toolbar
- App title: "Task Manager"
- User email display (read-only)
- [Logout] button (click -> logout + navigate /login)

ASCII wireframe (desktop/tablet)

```
+----------------------------------------------------------------------------+
| 📝 Task Manager                           user@email.com     [ Logout ]    |
+----------------------------------------------------------------------------+
| (page content renders below)                                               |
+----------------------------------------------------------------------------+
```

Responsive notes:
- On small screens, keep title left; truncate email; ensure Logout remains tap-friendly.

HTML structure (logical)

```html
<header>
  <nav class="navbar">
    <div class="brand">📝 Task Manager</div>
    <div class="actions">
      <span class="user-email">user@email.com</span>
      <button type="button">Logout</button>
    </div>
  </nav>
</header>
```

---

## 3) Login Page

Component: `src/frontend/src/pages/LoginPage.jsx`

UI
- Title: "Task Manager"
- Subtitle: "Login"
- Error Alert (visible only on failure)
- Fields: Email, Password
- Primary CTA: [Login]
- Secondary link: [Register here] -> `/register`

ASCII wireframe (wide)

```
+----------------------------------------------------------------------------+
|                             (centered container)                           |
|                                                                            |
|                         📝 Task Manager                                     |
|                              Login                                         |
|                                                                            |
|  [Alert: error message (if any)]                                            |
|                                                                            |
|  Email                                                                     |
|  [______________________________]                                          |
|                                                                            |
|  Password                                                                  |
|  [______________________________]                                          |
|                                                                            |
|  [ Login ]                                                                 |
|                                                                            |
|  No account?  Register here (link -> /register)                             |
+----------------------------------------------------------------------------+
```

Mobile variant

```
+----------------------------------+
| 📝 Task Manager                   |
| Login                              |
| [Alert: error]                     |
| Email                              |
| [______________]                   |
| Password                           |
| [______________]                   |
| [ Login ]                          |
| No account? Register here           |
+----------------------------------+
```

Interactions:
- Submit calls `login(form)` API
- On success: `loginUser(user, token)` then navigate to `/dashboard`
- On failure: show Alert with error message

---

## 4) Register Page

Component: `src/frontend/src/pages/RegisterPage.jsx`

UI
- Title: "Task Manager"
- Subtitle: "Register"
- Alerts:
  - error (API failure)
  - success ("Registered successfully! Redirecting to login...") -> after ~2s navigate to `/login`
- Fields: Username, Email, Password
- Primary CTA: [Register]
- Secondary link: [Login here] -> `/login`

ASCII wireframe (wide)

```
+----------------------------------------------------------------------------+
|                             (centered container)                           |
|                                                                            |
|                         📝 Task Manager                                     |
|                             Register                                       |
|                                                                            |
|  [Alert: error message (optional)]                                          |
|  [Alert: success message (optional)]                                        |
|                                                                            |
|  Username                                                                  |
|  [______________________________]                                          |
|                                                                            |
|  Email                                                                     |
|  [______________________________]                                          |
|                                                                            |
|  Password                                                                  |
|  [______________________________]                                          |
|                                                                            |
|  [ Register ]                                                              |
|                                                                            |
|  Have account? Login here (link -> /login)                                  |
+----------------------------------------------------------------------------+
```

Mobile variant

```
+----------------------------------+
| 📝 Task Manager                   |
| Register                           |
| [Alert: error/success]             |
| Username                           |
| [______________]                   |
| Email                              |
| [______________]                   |
| Password                           |
| [______________]                   |
| [ Register ]                       |
| Have account? Login here            |
+----------------------------------+
```

---

## 5) Dashboard Page

Component: `src/frontend/src/pages/DashboardPage.jsx`

Composes: Navbar + task list grid + TaskForm dialog.

Header area
- Navbar
- "Welcome, {username}!"
- Primary CTA: [+ Add Task] (opens TaskForm in Add mode)

Stats / filters
- Chips: All, Todo, InProgress, Done
  - Each chip shows count
  - Click changes `filterStatus` and filters the grid

Main content
- Task cards in a responsive grid (xs=12, sm=6, md=4)
- Card content: Title, description, chips (priority/status/category), optional due date
- Card actions: [Edit] [Delete]
- Empty state message when no tasks match filter

ASCII wireframe (wide)

```
+----------------------------------------------------------------------------+
| 📝 Task Manager                           user@email.com     [ Logout ]    |
+----------------------------------------------------------------------------+
| Welcome, {username}!                                     [ + Add Task ]    |
|                                                                            |
| [All: N] [Todo: n] [InProgress: n] [Done: n]  (chips act as filters)       |
|                                                                            |
|  +------------------+  +------------------+  +------------------+          |
|  | Task Title       |  | Task Title       |  | Task Title       |          |
|  | description...   |  | description...   |  | description...   |          |
|  | [High] [Todo]    |  | [Med] [Done]     |  | [Low][InProg]    |          |
|  | [Category]       |  |                  |  |                  |          |
|  | Due: YYYY-MM-DD  |  |                  |  | Due: YYYY-MM-DD  |          |
|  | [Edit] [Delete]  |  | [Edit] [Delete]  |  | [Edit] [Delete]  |          |
|  +------------------+  +------------------+  +------------------+          |
|                                                                            |
| (Empty state) "No tasks found. Click + Add Task to get started!"           |
+----------------------------------------------------------------------------+
```

Mobile variant (grid becomes single column)

```
+----------------------------------+
| 📝 Task Manager   [Logout]        |
| Welcome, {username}!              |
| [ + Add Task ]                    |
| [All:N] [Todo:n] [InProg:n] [Done:n] |
|                                  |
| +------------------------------+ |
| | Task Title                   | |
| | description...               | |
| | [Priority] [Status] [Cat]    | |
| | Due: YYYY-MM-DD              | |
| | [Edit] [Delete]              | |
| +------------------------------+ |
+----------------------------------+
```

---

## 6) Task Form (Dialog) - Add / Edit

Component: `src/frontend/src/components/TaskForm.jsx`

Renders as a modal Dialog above Dashboard.

Modes:
- Add New Task (no `editTask`): title="Add New Task", primary button="Save"
- Edit Task (has `editTask`): title="Edit Task", primary button="Update"

Fields
- Title (text)
- Description (multiline, 2 rows)
- Priority (select: High / Medium / Low)
- Status (select: Todo / InProgress / Done)
- Category (text)
- Due Date (date picker)

Actions
- [Cancel] closes dialog
- [Save/Update] persists (createTask/updateTask) -> onSaved() -> close

ASCII wireframe (desktop)

```
+--------------------------------------------------------------------------+
| (Modal)  Add New Task / Edit Task                               [ X ]     |
|--------------------------------------------------------------------------|
| Title                                                                    |
| [____________________________________________]                           |
| Description                                                              |
| [____________________________________________]                           |
| [____________________________________________]  (2 rows)                |
| Priority                 Status                                          |
| [ Medium  v ]            [ Todo      v ]                                 |
| Category                                                                 |
| [____________________________________________]                           |
| Due Date                                                                 |
| [ YYYY-MM-DD ] (date picker)                                             |
|                                                                          |
|                                      [ Cancel ]  [ Save / Update ]       |
+--------------------------------------------------------------------------+
```

Mobile variant

```
+----------------------------------+
| Add/Edit Task              [X]   |
| Title                           |
| [______________]                |
| Description                     |
| [______________]                |
| [______________]                |
| Priority                        |
| [Medium v]                      |
| Status                          |
| [Todo v]                        |
| Category                        |
| [______________]                |
| Due Date                        |
| [YYYY-MM-DD]                    |
| [Cancel]     [Save/Update]      |
+----------------------------------+
```

---

## 7) User interaction flows

### 7.1 Auth
1. Open app
2. Redirect to `/login` (default route)
3. Login
   - Success -> `/dashboard`
   - Failure -> error Alert
4. Logout (Navbar) -> `/login`

### 7.2 Task lifecycle
Add:
1. Click [+ Add Task]
2. Dialog opens (Add mode)
3. Fill fields -> [Save]
4. API creates task -> dialog closes -> dashboard refresh

Edit:
1. Click [Edit] on a task card
2. Dialog opens with prefilled data
3. Click [Update]
4. API updates -> dialog closes -> refresh

Delete:
1. Click [Delete]
2. API deletes -> refresh

### 7.3 Filter by status
1. Click chip (Todo / InProgress / Done)
2. Grid updates to show tasks matching status

---

## 8) Component inventory

- Navbar (AppBar/Toolbar)
- AuthContainer (centered layout container)
- Alerts (error/success)
- Text fields: username, email, password, task title, description, category, due date
- Selects: priority, status
- Chips: status filter chips + task badges
- Task Card (CardContent + CardActions)
- Buttons: Login, Register, Add Task, Edit, Delete, Cancel, Save/Update, Logout
- Modal Dialog: TaskForm

---

## 9) Navigation map (graph)

```
open app
  |
  v
+---------+        (link)        +-----------+
| Login   | -------------------> | Register  |
+---------+ <------------------- +-----------+
   |  (success)                        |
   v                                  | (success -> redirect)
+-----------+                          v
| Dashboard | <---------------------- Login
+-----------+
   |
   | (Logout)
   v
  Login
```
