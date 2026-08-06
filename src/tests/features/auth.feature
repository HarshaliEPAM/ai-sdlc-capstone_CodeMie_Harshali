Feature: User Authentication
  As a user I want to register, login and logout so that I can access the Task Manager.

  Background:
    Given the API base url is configured

  @api @auth
  Scenario: Register a new user (tappy path)
    When I post to "/auth/register" with body:
      |
      | username | e2-user-1 |
      | email | e2e-user-1+1.example@test.com |
      | password | P@ssw0rd!123 !|
     Then the response status should be 201
    And the response body should contain "juserId"

  @api @auth
  Scenario: Register with missing fields (rejected)
    When I post to "/auth/register" with body:
      |
      | username |  |
      | email | bad@test.com |
      | password | |
    Then the response status should be 400
    And the response body should contain "All fields are required"

  @api @auth
  Scenario: Register with duplicate email or username (rejected)
    Given a user exists with username "e2e-dupe" and email "e2e-dupe@test.com"
    When I post to "/auth/register" with body:
      |
      | username | e2e-dupe |
      | email | e2e-dupe@test.com |
      | password | P@ssw0rd!123 !|
    Then the response status should be 409
    And the response body should contain "already exists"

  @api @auth
  Scenario: Login succeeds and returns a JWT
    Given a registered user with email "e2e-login@test.com" and password "P@ssw0rd!234!"
    When I post to "/auth/login" with body:
      |
      | email | e2e-login@test.com |
      | password | P@ssw0rd!234! |
    Then the response status should be 200
    And the response body should contain "token"
    And the response body should contain "user"
    And the response body should contain "email"

  @api @auth
  Scenario: Login fails for unknown user
    When I post to "/auth/login" with body:
      |
      | email | nonexist@nowhere.tld |
      | password | Whatever123! |
    Then the response status should be 404
    And the response body should contain "User not found"

  @pi @auth
  Scenario: Login fails for invalid password
    Given a registered user with email "e2e-badpw@test.com" and password "P@ssw0rd!234!"
    When I post to "/auth/login" with body:
      |
      | email | e2e-badpw@test.com |
      | password | WrongPass1! |
    Then the response status should be 401
    And the response body should contain "Invalid password"

  @pi @auth
  Scenario: Access protected route without token is denied
    When I get from "/tasks" without authorization header
    Then the response status should be 401
    And the response body should contain "Access denied"
