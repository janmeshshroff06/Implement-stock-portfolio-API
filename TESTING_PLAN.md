# Final Project Phase 2 Testing Plan

Use this plan in Swagger UI to verify deployment, authentication, CRUD operations, authorization, and error handling.

## Submission Links

- Public repository: `https://github.com/janmeshshroff06/Implement-stock-portfolio-API`
- Live API base URL: `https://stock-portfolio-api-kzgm.onrender.com`
- Live API documentation: `https://stock-portfolio-api-kzgm.onrender.com/api-docs`
- OpenAPI JSON: `https://stock-portfolio-api-kzgm.onrender.com/openapi.json`
- Health check: `https://stock-portfolio-api-kzgm.onrender.com/health`

## Seed Data

The Render start command runs migrations and the seed script automatically. The seed script resets seeded data to deterministic IDs.

Credentials:

- Admin: `admin@example.com` / `Password123!`
- Owner user: `investor@example.com` / `Password123!`
- Non-owner user: `not-owner@example.com` / `Password123!`

Seeded IDs:

- Admin user: `1`
- Admin portfolio: `1`
- Admin holding: `1`
- Admin transaction: `1`
- Owner user: `2`
- Owner portfolio: `2`
- Owner holdings: `2` and `3`
- Owner transactions: `2` and `3`
- Non-owner user: `3`
- Non-owner portfolio: `3`
- Non-owner holding: `4`
- Non-owner transaction: `4`

## Swagger Authentication Setup

1. Open `https://stock-portfolio-api-kzgm.onrender.com/api-docs`.
2. Open `POST /api/auth/login`.
3. Click `Try it out`.
4. Enter one of the seeded credentials.
5. Click `Execute`.
6. Copy the returned JWT token.
7. Click the `Authorize` button at the top of Swagger UI.
8. Paste `Bearer <token>` and click `Authorize`.
9. Click `Close`.

## GET /health

Access Control: Public

Success Case:
1. Open `GET /health`.
2. Click `Try it out`.
3. Click `Execute`.
4. Expect `200 OK`.
5. Expected response:
```json
{
  "status": "ok"
}
```
Result:
<img width="838" height="502" alt="image" src="https://github.com/user-attachments/assets/39c82eb6-e05d-4416-8297-37939ebf9c15" />


## POST /api/auth/signup

Access Control: Public

Success Case:
1. Open `POST /api/auth/signup`.
2. Click `Try it out`.
3. Use a unique email:
```json
{
  "email": "phase2-new-user@example.com",
  "password": "Password123!"
}
```
4. Click `Execute`.
5. Expect `201 Created` with `id`, `email`, `role`, and `createdAt`.

Result:
<img width="992" height="572" alt="image" src="https://github.com/user-attachments/assets/a9615c84-ec07-4fae-9b86-1332d5e36864" />

400 Bad Request:
1. Remove the `password` field:
```json
{
  "email": "missing-password@example.com"
}
```
2. Click `Execute`.
3. Expect `400 Bad Request`.

Result:
<img width="465" height="262" alt="Screenshot 2026-04-23 at 9 37 18 AM" src="https://github.com/user-attachments/assets/7b1ebc8e-d3a1-4c5e-8e67-4776df9d41a2" />

409 Conflict:
1. Use an existing seed email:
```json
{
  "email": "investor@example.com",
  "password": "Password123!"
}
```
2. Click `Execute`.
3. Expect `409 Conflict`.

Result:
<img width="522" height="276" alt="Screenshot 2026-04-23 at 9 38 40 AM" src="https://github.com/user-attachments/assets/81dd1b54-1784-4062-80b4-c3e8546e16a7" />

## POST /api/auth/login

Access Control: Public

Success Case:
1. Open `POST /api/auth/login`.
2. Use:
```json
{
  "email": "investor@example.com",
  "password": "Password123!"
}
```
3. Click `Execute`.
4. Expect `200 OK` with a `token`.

Result:
<img width="2760" height="496" alt="image" src="https://github.com/user-attachments/assets/89b17343-e854-46b5-b0dc-5c8f2da87071" />

400 Bad Request:
1. Remove the `password` field:
```json
{
  "email": "investor@example.com"
}
```
2. Click `Execute`.
3. Expect `400 Bad Request`.

Result:
<img width="480" height="274" alt="Screenshot 2026-04-23 at 9 44 16 AM" src="https://github.com/user-attachments/assets/53e7f65a-da71-4380-bd3b-7ab913d125ce" />

401 Unauthorized:
1. Use the wrong password:
```json
{
  "email": "investor@example.com",
  "password": "WrongPassword123!"
}
```
2. Click `Execute`.
3. Expect `401 Unauthorized`.

Result:
<img width="902" height="538" alt="image" src="https://github.com/user-attachments/assets/3859ebe8-5c0c-4419-a456-f8d3eea0fe86" />


## Portfolio Resource Tests

### GET /api/portfolios

Access Control: Authenticated users only. Regular users see their own portfolios. Admin users see all portfolios.

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/portfolios`.
3. Click `Execute`.
4. Expect `200 OK` with an array containing portfolio ID `2`.

401 Unauthorized:
1. Click `Authorize`, then `Logout`.
2. Run `GET /api/portfolios`.
3. Expect `401 Unauthorized`.

### POST /api/portfolios

Access Control: Authenticated users only

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `POST /api/portfolios`.
3. Use:
```json
{
  "name": "Swagger Test Portfolio",
  "description": "Created during grading"
}
```
4. Click `Execute`.
5. Expect `201 Created` with the created portfolio.

400 Bad Request:
1. Use:
```json
{
  "description": "Missing required name"
}
```
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run `POST /api/portfolios` with the success body.
3. Expect `401 Unauthorized`.

### GET /api/portfolios/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/portfolios/{id}`.
3. Enter ID `2`.
4. Click `Execute`.
5. Expect `200 OK` with owner portfolio ID `2`.

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Enter ID `2`.
3. Click `Execute`.
4. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com` and authorize Swagger.
2. Enter ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com` and authorize Swagger.
2. Enter ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### PUT /api/portfolios/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `PUT /api/portfolios/{id}`.
3. Enter ID `2`.
4. Use:
```json
{
  "name": "Updated Investor Portfolio",
  "description": "Updated through Swagger"
}
```
5. Click `Execute`.
6. Expect `200 OK` with updated portfolio ID `2`.

400 Bad Request:
1. Enter ID `2`.
2. Use:
```json
{
  "name": ""
}
```
3. Click `Execute`.
4. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### DELETE /api/portfolios/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Create a temporary portfolio with `POST /api/portfolios`.
3. Copy the new returned `id`.
4. Open `DELETE /api/portfolios/{id}`.
5. Enter the temporary portfolio ID.
6. Click `Execute`.
7. Expect `204 No Content`.

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run `DELETE /api/portfolios/{id}` with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### GET /api/portfolios/{id}/summary

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/portfolios/{id}/summary`.
3. Enter ID `2`.
4. Click `Execute`.
5. Expect `200 OK`.
6. Expected seeded response:
```json
{
  "totalValue": 14650,
  "totalInvestment": 14650,
  "profitLoss": 0
}
```

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

## Holding Resource Tests

### GET /api/holdings

Access Control: Authenticated users only. Regular users see their own holdings. Admin users see all holdings.

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/holdings`.
3. Click `Execute`.
4. Expect `200 OK` with seeded holding IDs `2` and `3`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint.
3. Expect `401 Unauthorized`.

### POST /api/holdings

Access Control: Portfolio owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `POST /api/holdings`.
3. Use owner portfolio ID `2`:
```json
{
  "portfolioId": 2,
  "symbol": "NVDA",
  "totalShares": 5,
  "avgPrice": 850
}
```
4. Click `Execute`.
5. Expect `201 Created`.

400 Bad Request:
1. Use:
```json
{
  "portfolioId": -10,
  "symbol": "NVDA",
  "totalShares": 5,
  "avgPrice": 850
}
```
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with the success body.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use owner portfolio ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use `portfolioId` `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### GET /api/holdings/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/holdings/{id}`.
3. Enter ID `2`.
4. Click `Execute`.
5. Expect `200 OK` with holding ID `2`.

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use holding ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### PUT /api/holdings/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `PUT /api/holdings/{id}`.
3. Enter ID `2`.
4. Use:
```json
{
  "symbol": "MSFT",
  "totalShares": 45,
  "avgPrice": 315
}
```
5. Click `Execute`.
6. Expect `200 OK` with updated holding ID `2`.

400 Bad Request:
1. Enter ID `2`.
2. Use:
```json
{
  "totalShares": -1
}
```
3. Click `Execute`.
4. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use holding ID `2`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

### DELETE /api/holdings/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Create a temporary holding using `POST /api/holdings` with portfolio ID `2`.
3. Copy the created holding ID.
4. Open `DELETE /api/holdings/{id}`.
5. Enter the temporary holding ID.
6. Click `Execute`.
7. Expect `204 No Content`.

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use holding ID `2`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

## Transaction Resource Tests

### GET /api/transactions

Access Control: Authenticated users only. Regular users see their own transactions. Admin users see all transactions.

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/transactions`.
3. Click `Execute`.
4. Expect `200 OK` with seeded transaction IDs `2` and `3`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint.
3. Expect `401 Unauthorized`.

### POST /api/transactions

Access Control: Holding owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `POST /api/transactions`.
3. Use owner holding ID `2`:
```json
{
  "holdingId": 2,
  "type": "BUY",
  "quantity": 3,
  "price": 320,
  "transactionDate": "2026-04-22T14:30:00.000Z"
}
```
4. Click `Execute`.
5. Expect `201 Created`.

400 Bad Request:
1. Use:
```json
{
  "holdingId": 2,
  "type": "HOLD",
  "quantity": 3,
  "price": 320,
  "transactionDate": "2026-04-22T14:30:00.000Z"
}
```
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with the success body.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use owner holding ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use `holdingId` `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### GET /api/transactions/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `GET /api/transactions/{id}`.
3. Enter ID `2`.
4. Click `Execute`.
5. Expect `200 OK` with transaction ID `2`.

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use transaction ID `2`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

### PUT /api/transactions/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Open `PUT /api/transactions/{id}`.
3. Enter ID `2`.
4. Use:
```json
{
  "type": "BUY",
  "quantity": 4,
  "price": 325,
  "transactionDate": "2026-04-22T15:30:00.000Z"
}
```
5. Click `Execute`.
6. Expect `200 OK` with updated transaction ID `2`.

400 Bad Request:
1. Enter ID `2`.
2. Use:
```json
{
  "quantity": -1
}
```
3. Click `Execute`.
4. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use transaction ID `2`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

### DELETE /api/transactions/{id}

Access Control: Owner or admin

Success Case:
1. Log in as `investor@example.com` and authorize Swagger.
2. Create a temporary transaction using `POST /api/transactions` with holding ID `2`.
3. Copy the created transaction ID.
4. Open `DELETE /api/transactions/{id}`.
5. Enter the temporary transaction ID.
6. Click `Execute`.
7. Expect `204 No Content`.

400 Bad Request:
1. Enter ID `-10`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with ID `2`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use transaction ID `2`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.
