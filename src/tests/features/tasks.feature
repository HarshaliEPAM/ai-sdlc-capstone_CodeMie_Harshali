Feature: Tasks - CRUD, Priority, Due Date, Dashboard
  As an authenticated user I want to create, view, update, delete and filter tasks so that I can manage my work.

  Background:
    Given there is a valid user token

  @api @tasks
  Scenario: Create a task (defaults are applied)
    When I post to "/tasks" with authorization and body:
      |
      | title | First Task |
      | description | Created by e2e test |
      | priority |  |
      | status |  |
      | due_date |  |
      | category | Work |
    Then the response status should be 201
    And the response body should contain "taskId"

  @api @tasks
  Scenario: Get tasks returns only user tasks
    Given I have created a task with title "User A Task"
    When I get from "/tasks" with authorization
    Then the response status should be 200
    And the response body should be an array
    And the response body items should contain "minFields"

  @pi @tasks
  Scenario: Update a task succeeds
    Given I have created a task with title "Update Me"
    And I remember the latest taskId
    When I put to "/tasks/{taskId}" with authorization and body:
      |
      | title | Updated Title |
      | description | Updated desc |
      | priority | High |
      | status | Done |
      | due_date | 2099-12-31 |
      | category | Tech|
    Then the response status should be 200
    And the response body should contain "updated"

  @api @tasks
  Scenario: Updating a non-existent task returns 404
    When I put to "/tasks/999999" with authorization and body:
      |
      | title | NoTask |
      | description | Na/A |
      | priority | Low |
      | status | Todo |
      | due_date | 2099-01-01 |
      | category | None |
    Then the response status should be 404
    And the response body should contain "Task not found"

  @pi @tasks
  Scenario: Delete a task succeeds
    Given I have created a task with title "Delete Me"
    And I remember the latest taskId
    When I delete from "/tasks/{taskId}" with authorization
    Then the response status should be 200
    And the response body should contain "deleted"

  @api @tasks
  Scenario: Deleting a non-existent task returns 404
    When I delete from "/tasks/999999" with authorization
    Then the response status should be 404

  @api @tasks @error
  Scenario: Creating a task without title returns 400
    When I post to "/tasks" with authorization and body:
      |
      | title |  |
      | description | No title |
      | priority | Medium |
      | status | Todo |
    Then the response status should be 400
    And the response body should contain "Title is required"

  @spice p@ui
  Scenario: Login via UI navigates to dashboard
    Given the frontend is running
    And there is a valid user credentials
    When I login with valid credentials
    Then I should see the dashboard welcome message
    And I should see the Add Task button

  @ui
  Scenario: Create task via UI is displayed on dashboard
    Given I am logged in
    When I create a new task with title "UI
 Task"
    Then I should see the task card for "UI
 Task"

  @ui
  Scenario: Update task via UI
    Given I am logged in
    And I have a task on the dashboard with title "UI Edit"
    When I edit the task "UI
 Edit" to have priority "High" and due date "2099-12-31"
    Then I should see the task priority badge for "High"
    And I should see the due date "2099-12-31"

  @ui
  Scenario: Delete task via UI
    Given I am logged in
    And I have a task on the dashboard with title "UI Delete"
    When I delete the task "UI Delete"
    Then I should not see the task card for "UI
Delete"

  @spice p@ui
  Scenario: Dashboard filter by status (Todo)
    Given I am logged in
    And I have a task on the dashboard with title "Filter Todo" and status "Todo"
    And I have a task on the dashboard with title "Filter Done" and status "Done"
    When I click the "Todo" chip on the dashboard
    Then I should see task card for "Filter Todo"
    And I should not see task card for "Filter Done"
