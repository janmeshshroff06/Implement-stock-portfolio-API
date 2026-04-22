# Design Document: Stock Portfolio & Transaction API

Janmesh Shroff  
ITIS 4166  
Spring 2026

## 1. API Overview

The Stock Portfolio and Transaction API is a REST-based application that allows users to manage and track personal investments. The system lets users create and manage stock portfolios and record buy and sell activity over time. Its main purpose is to help users monitor investment performance while maintaining a complete history of financial activity.

The API includes a `User` resource for authentication and authorization using JSON Web Tokens (JWT). Users can create an account, log in, and securely access protected endpoints. The system uses access control to ensure a user cannot view or modify another user's data unless administrative privileges are explicitly provided.

In addition to `User`, the application has three primary CRUD resources:

- `Portfolio`: A collection of investments owned by one user. A user may own multiple portfolios. Each portfolio has a required name and an optional description.
- `Holding`: A stock position within a portfolio, such as `AAPL` or `TSLA`. A holding stores the stock symbol, number of shares owned, and average cost basis.
- `Transaction`: A historical buy or sell record tied to a holding. Each transaction stores the transaction type (`BUY` or `SELL`), quantity, price per share, and transaction date.

### Resource Summary

- `User`: Handles authentication and authorization using JWT
- `Portfolio`: Represents a collection of investments owned by a user
- `Holding`: Represents a stock position within a portfolio
- `Transaction`: Represents buy/sell activity for a holding

### Relationships

- One User -> Many Portfolios
- One Portfolio -> Many Holdings
- One Holding -> Many Transactions

This structure preserves both the current investment state (`holdings`) and the historical activity (`transactions`), improving clarity, scalability, and query performance.

## 2. ER Diagram

The ER diagram for this system uses Crow's Foot notation to show entities, primary keys, foreign keys, and cardinality.

Figure 1: Entity-Relationship Diagram for the Stock Portfolio and Transaction API

The design intentionally separates holdings from transactions. Holdings represent the current state of a portfolio, while transactions preserve the full activity history. This avoids repeatedly recalculating portfolio state from scratch and supports efficient reporting and analytics.

## 3. Resource Endpoints

The following sections define the authentication endpoints and the three main resources: portfolios, holdings, and transactions. Each endpoint lists its purpose, access control rules, expected success response, and common error cases.

### 3.1 Authentication Endpoints

**Endpoint:** `POST /api/auth/signup`  
**Description:** Creates a new user account.

**Success Response (`201 Created`)**

```json
{
  "id": 1,
  "email": "user@email.com"
}
```

**Error Cases**

- `400 Bad Request`: Missing or invalid fields
- `409 Conflict`: Email already exists

**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticates a user and returns a JWT token.

**Success Response (`200 OK`)**

```json
{
  "token": "jwt_token_here"
}
```

**Error Cases**

- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

### 3.2 Portfolio Endpoints

**Endpoint:** `POST /api/portfolios`  
**Description:** Creates a new portfolio for the authenticated user.  
**Access Control:** Authenticated users only

**Success Response (`201 Created`)**

```json
{
  "id": 1,
  "name": "Long-Term Portfolio"
}
```

**Error Cases**

- `400 Bad Request`: Missing or invalid fields
- `401 Unauthorized`: User not authenticated

**Endpoint:** `GET /api/portfolios`  
**Description:** Retrieves all portfolios belonging to the authenticated user.  
**Access Control:** Authenticated users only

**Success Response (`200 OK`)**

```json
[
  {
    "id": 1,
    "name": "Long-Term Portfolio"
  }
]
```

**Error Cases**

- `401 Unauthorized`: User not authenticated

**Endpoint:** `GET /api/portfolios/:id`  
**Description:** Retrieves a specific portfolio by ID.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "id": 1,
  "name": "Long-Term Portfolio"
}
```

**Error Cases**

- `400 Bad Request`: Invalid portfolio ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Portfolio does not exist

**Endpoint:** `PUT /api/portfolios/:id`  
**Description:** Updates an existing portfolio.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "id": 1,
  "name": "Updated Portfolio"
}
```

**Error Cases**

- `400 Bad Request`: Missing or invalid fields
- `403 Forbidden`: Not the owner
- `404 Not Found`: Portfolio does not exist

**Endpoint:** `DELETE /api/portfolios/:id`  
**Description:** Deletes a portfolio.  
**Access Control:** Owner only

**Success Response (`204 No Content`)**

No response body.

**Error Cases**

- `400 Bad Request`: Invalid portfolio ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Portfolio does not exist

### 3.3 Holdings Endpoints

**Endpoint:** `POST /api/holdings`  
**Description:** Adds a stock to a portfolio.  
**Access Control:** Portfolio owner only

**Success Response (`201 Created`)**

```json
{
  "id": 1,
  "symbol": "AAPL"
}
```

**Error Cases**

- `400 Bad Request`: Missing or invalid fields
- `403 Forbidden`: Not the portfolio owner

**Endpoint:** `GET /api/holdings`  
**Description:** Retrieves all holdings for the authenticated user.  
**Access Control:** Authenticated users only

**Success Response (`200 OK`)**

```json
[
  {
    "id": 1,
    "symbol": "AAPL"
  }
]
```

**Error Cases**

- `401 Unauthorized`: User not authenticated

**Endpoint:** `GET /api/holdings/:id`  
**Description:** Retrieves a specific holding.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "id": 1,
  "symbol": "AAPL",
  "totalShares": 50,
  "avgPrice": 150
}
```

**Error Cases**

- `400 Bad Request`: Invalid holding ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Holding does not exist

**Endpoint:** `PUT /api/holdings/:id`  
**Description:** Updates a holding.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "id": 1,
  "symbol": "AAPL",
  "totalShares": 75,
  "avgPrice": 155
}
```

**Error Cases**

- `400 Bad Request`: Missing or invalid fields
- `403 Forbidden`: Not the owner
- `404 Not Found`: Holding does not exist

**Endpoint:** `DELETE /api/holdings/:id`  
**Description:** Deletes a holding.  
**Access Control:** Owner only

**Success Response (`204 No Content`)**

No response body.

**Error Cases**

- `400 Bad Request`: Invalid holding ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Holding does not exist

### 3.4 Transaction Endpoints

**Endpoint:** `POST /api/transactions`  
**Description:** Adds a buy or sell transaction.  
**Access Control:** Owner only

**Success Response (`201 Created`)**

```json
{
  "id": 1,
  "type": "BUY"
}
```

**Error Cases**

- `400 Bad Request`: Invalid transaction data
- `403 Forbidden`: Not the owner
- `404 Not Found`: Holding does not exist

**Endpoint:** `GET /api/transactions`  
**Description:** Retrieves all transactions for the authenticated user.  
**Access Control:** Authenticated users only

**Success Response (`200 OK`)**

```json
[
  {
    "id": 1,
    "type": "BUY",
    "quantity": 10,
    "price": 155
  }
]
```

**Error Cases**

- `401 Unauthorized`: User not authenticated

**Endpoint:** `GET /api/transactions/:id`  
**Description:** Retrieves a specific transaction.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "id": 1,
  "type": "BUY",
  "quantity": 10,
  "price": 155
}
```

**Error Cases**

- `400 Bad Request`: Invalid transaction ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Transaction does not exist

**Endpoint:** `PUT /api/transactions/:id`  
**Description:** Updates a transaction.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "id": 1,
  "type": "SELL",
  "quantity": 5,
  "price": 160
}
```

**Error Cases**

- `400 Bad Request`: Missing or invalid fields
- `403 Forbidden`: Not the owner
- `404 Not Found`: Transaction does not exist

**Endpoint:** `DELETE /api/transactions/:id`  
**Description:** Deletes a transaction.  
**Access Control:** Owner only

**Success Response (`204 No Content`)**

No response body.

**Error Cases**

- `400 Bad Request`: Invalid transaction ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Transaction does not exist

## 4. Analytics Feature

**Endpoint:** `GET /api/portfolios/:id/summary`  
**Description:** Returns a summary of portfolio performance, including total value, total investment, and profit or loss.  
**Access Control:** Owner only

**Success Response (`200 OK`)**

```json
{
  "totalValue": 12000,
  "totalInvestment": 10000,
  "profitLoss": 2000
}
```

**Error Cases**

- `400 Bad Request`: Invalid portfolio ID format
- `403 Forbidden`: Not the owner
- `404 Not Found`: Portfolio does not exist

## 5. Design Justification

Separating holdings from transactions improves clarity and efficiency. Holdings show the current state of a portfolio, while transactions record every historical change. This reduces repeated computation, makes the data model easier to reason about, and supports future analytics features as the system grows.

## Phase 1 Notes

The following Phase 1 grading corrections have been incorporated into this version of the design:

- All `DELETE` endpoints now use `204 No Content` instead of `200 OK`.
- Missing `400 Bad Request` cases were added for the following endpoints:
- `GET /api/portfolios/:id`
- `DELETE /api/portfolios/:id`
- `GET /api/holdings/:id`
- `DELETE /api/holdings/:id`
- `GET /api/transactions/:id`
- `DELETE /api/transactions/:id`

For Phase 1, these `400` errors are intended to cover malformed or invalid route parameter values, while `404` is reserved for valid IDs that do not match an existing resource.
