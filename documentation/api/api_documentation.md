## API Dokumentácia

Táto sekcia obsahuje vizuálnu dokumentáciu REST API.

OpenAPI dokumentácia sa nachádza na adrese https://localhost:8443/swagger-ui/index.html#/

---

### Legenda
- 🔒 – endpoint vyžaduje autentifikáciu (JWT token)
- `Client` – frontend / externý konzument API
- Controller – backendová REST vrstva
- DB – databáza
- File Storage – úložisko dokumentov

---

### Celková architektúra API

```mermaid
flowchart LR
    Client --> AuthController
    Client --> AccountController
    Client --> DashboardController
    Client --> DocumentController
    Client --> ExternalController
    Client --> AdminUserController

    AuthController --> DB[(Database)]
    AccountController --> DB
    DashboardController --> DB
    AdminUserController --> DB
    DocumentController --> FS[(File Storage)]
```

```mermaid
flowchart TD
    Client -->|POST| /auth/login
    Client -->|POST| /auth/register/student
    Client -->|POST| /auth/register/company
    Client -->|POST| /auth/register/admin

    Client -->|POST| /auth/request-password-reset
    Client -->|POST| /auth/reset-password
    Client -->|GET| /auth/verify-reset-token
    Client -->|GET| /auth/verify-email

    Client -->|POST 🔒| /auth/change-password
    Client -->|POST 🔒| /auth/force-change-password

    Client -->|GET| /auth/me
    Client -->|GET| /auth/study-programs
    Client -->|GET| /auth/companies
```

---

```mermaid
flowchart TD
    Client -->|GET 🔒| /account/me
    Client -->|PUT 🔒| /account/update
    Client -->|GET| /account/departments
    Client -->|GET| /account/study-programs
```

---

```mermaid
flowchart TD
    Client -->|POST 🔒| /dashboard/internship
    Client -->|POST 🔒| /dashboard/internship/id/company-decision
    Client -->|POST 🔒| /dashboard/internship/id/admin-state

    Client -->|GET 🔒| /dashboard/students
    Client -->|GET 🔒| /dashboard/mentors
    Client -->|GET 🔒| /dashboard/companies

    Client -->|GET 🔒| /dashboard/internships
    Client -->|GET 🔒| /dashboard/internships/id/documents
    Client -->|GET 🔒| /dashboard/internships/export
```

---

```mermaid
flowchart TD
    Client -->|POST 🔒| /documents/upload/timestatement
    Client -->|POST 🔒| /documents/upload/contract

    Client -->|POST 🔒| /documents/id/company-decision

    Client -->|GET 🔒| /documents/id/download
    Client -->|GET| /documents/contracts/template
    Client -->|GET 🔒| /documents/contracts/generated
```

---

```mermaid
flowchart TD
    Client -->|GET| /external/internships
    Client -->|POST| /external/internships/id/newStatus
```

---

```mermaid
flowchart TD
    Client -->|GET 🔒| /api/admin/users
    Client -->|POST 🔒| /api/admin/users/id/suspend
    Client -->|POST 🔒| /api/admin/users/id/reactivate
```