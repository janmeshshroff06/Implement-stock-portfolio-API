# Swagger UI Testing Plan

This testing plan verifies authentication, authorization, CRUD operations, and error handling for the Stock Portfolio & Transaction API.

## Setup

1. Open Swagger UI:
   `http://localhost:3000/api-docs`
2. Seed the database before testing:
   `npm run db:seed`
3. Known seed credentials:
   Admin user: `admin@example.com` / `Password123!`
   Regular owner user: `investor@example.com` / `Password123!`
   Regular non-owner user: `not-owner@example.com` / `Password123!`
4. To authenticate in Swagger:
   Open `POST /api/auth/login`, click `Try it out`, enter the credentials, and click `Execute`.
   Copy the returned `token`.
   Click the `Authorize` button at the top of Swagger UI and paste the token. If Swagger does not add the bearer prefix automatically, paste `Bearer <token>`.
5. For ID-based tests, first use the list endpoints to find current IDs:
   Owner portfolio: log in as `investor@example.com`, then run `GET /api/portfolios`.
   Owner holding: log in as `investor@example.com`, then run `GET /api/holdings`.
   Owner transaction: log in as `investor@example.com`, then run `GET /api/transactions`.
   Non-owner IDs: log in as `not-owner@example.com` and run the same list endpoints to find IDs owned by the other regular user.

## GET /health

Access Control: Public

Success Case:
1. Open `GET /health`.
2. Click `Try it out`.
3. Click `Execute`.
4. Expect `200 OK` with:
```json
{
  "status": "ok"
}
```

## POST /api/auth/signup

Access Control: Public

Success Case:
1. Open `POST /api/auth/signup`.
2. Use a new email:
```json
{
  "email": "newuser@example.com",
  "password": "Password123!"
}
```
3. Click `Execute`.
4. Expect `201 Created` with user `id`, `email`, `role`, and `createdAt`.

400 Bad Request:
1. Remove the `password` field.
2. Click `Execute`.
3. Expect `400 Bad Request`.

409 Conflict:
1. Use an email that already exists, such as `investor@example.com`.
2. Click `Execute`.
3. Expect `409 Conflict`.

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

400 Bad Request:
1. Remove the `password` field.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Use the wrong password.
2. Click `Execute`.
3. Expect `401 Unauthorized`.

## GET /api/portfolios

Access Control: Authenticated users only. Regular users see their own portfolios. Admin users can see all portfolios.

Setup:
Log in as `investor@example.com` and authorize Swagger with the returned JWT.

Success Case:
1. Open `GET /api/portfolios`.
2. Click `Try it out`.
3. Click `Execute`.
4. Expect `200 OK` with an array of portfolios owned by the logged-in user.

401 Unauthorized:
1. Click `Authorize`, then `Logout`.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

## POST /api/portfolios

Access Control: Authenticated users only

Setup:
Log in as `investor@example.com` and authorize Swagger.

Success Case:
1. Open `POST /api/portfolios`.
2. Use:
```json
{
  "name": "Swagger Test Portfolio",
  "description": "Created from Swagger UI"
}
```
3. Click `Execute`.
4. Expect `201 Created` with the created portfolio.

400 Bad Request:
1. Remove the `name` field or set it to an empty string.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

## GET /api/portfolios/{id}

Access Control: Owner or admin

Setup:
Log in as `investor@example.com`, run `GET /api/portfolios`, and copy one returned portfolio `id`.

Success Case:
1. Open `GET /api/portfolios/{id}`.
2. Enter an owned portfolio ID.
3. Click `Execute`.
4. Expect `200 OK` with the portfolio.

400 Bad Request:
1. Enter `-10` as the ID.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint with a valid portfolio ID.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use a portfolio ID owned by `investor@example.com`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Enter `999999` as the ID.
3. Click `Execute`.
4. Expect `404 Not Found`.

## PUT /api/portfolios/{id}

Access Control: Owner or admin

Setup:
Log in as `investor@example.com` and copy one owned portfolio ID from `GET /api/portfolios`.

Success Case:
1. Open `PUT /api/portfolios/{id}`.
2. Enter an owned portfolio ID.
3. Use:
```json
{
  "name": "Updated Swagger Portfolio",
  "description": "Updated through Swagger UI"
}
```
4. Click `Execute`.
5. Expect `200 OK` with the updated portfolio.

400 Bad Request:
1. Use an empty `name` value.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` portfolio ID.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

## DELETE /api/portfolios/{id}

Access Control: Owner or admin

Setup:
Create a temporary portfolio using `POST /api/portfolios`, then copy its ID.

Success Case:
1. Open `DELETE /api/portfolios/{id}`.
2. Enter the temporary portfolio ID.
3. Click `Execute`.
4. Expect `204 No Content`.

400 Bad Request:
1. Enter `-10` as the ID.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again with a valid ID.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use a portfolio ID owned by `investor@example.com`.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

## GET /api/portfolios/{id}/summary

Access Control: Owner or admin

Setup:
Log in as `investor@example.com` and copy one owned portfolio ID from `GET /api/portfolios`.

Success Case:
1. Open `GET /api/portfolios/{id}/summary`.
2. Enter an owned portfolio ID.
3. Click `Execute`.
4. Expect `200 OK` with `totalValue`, `totalInvestment`, and `profitLoss`.

400 Bad Request:
1. Enter `-10` as the ID.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` portfolio ID.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

## GET /api/holdings

Access Control: Authenticated users only. Regular users see holdings in their own portfolios. Admin users can see all holdings.

Setup:
Log in as `investor@example.com` and authorize Swagger.

Success Case:
1. Open `GET /api/holdings`.
2. Click `Execute`.
3. Expect `200 OK` with an array of holdings.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

## POST /api/holdings

Access Control: Portfolio owner or admin

Setup:
Log in as `investor@example.com`, run `GET /api/portfolios`, and copy one owned portfolio ID.

Success Case:
1. Open `POST /api/holdings`.
2. Use the copied portfolio ID:
```json
{
  "portfolioId": 1,
  "symbol": "NVDA",
  "totalShares": 5,
  "avgPrice": 850
}
```
3. Click `Execute`.
4. Expect `201 Created` with the created holding.

400 Bad Request:
1. Set `portfolioId` to `-10` or remove `symbol`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` portfolio ID.
3. Click `Execute`.
4. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use `portfolioId` `999999`.
3. Click `Execute`.
4. Expect `404 Not Found`.

## GET /api/holdings/{id}

Access Control: Owner or admin

Setup:
Log in as `investor@example.com`, run `GET /api/holdings`, and copy one returned holding ID.

Success Case:
1. Open `GET /api/holdings/{id}`.
2. Enter an owned holding ID.
3. Click `Execute`.
4. Expect `200 OK` with the holding and portfolio data.

400 Bad Request:
1. Enter `-10` as the ID.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` holding ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

## PUT /api/holdings/{id}

Access Control: Owner or admin

Setup:
Log in as `investor@example.com` and copy one owned holding ID from `GET /api/holdings`.

Success Case:
1. Open `PUT /api/holdings/{id}`.
2. Enter an owned holding ID.
3. Use:
```json
{
  "symbol": "MSFT",
  "totalShares": 45,
  "avgPrice": 315
}
```
4. Click `Execute`.
5. Expect `200 OK` with the updated holding.

400 Bad Request:
1. Set `totalShares` to `-1`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` holding ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

## DELETE /api/holdings/{id}

Access Control: Owner or admin

Setup:
Create a temporary holding using `POST /api/holdings`, then copy its ID.

Success Case:
1. Open `DELETE /api/holdings/{id}`.
2. Enter the temporary holding ID.
3. Click `Execute`.
4. Expect `204 No Content`.

400 Bad Request:
1. Enter `-10`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` holding ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

## GET /api/transactions

Access Control: Authenticated users only. Regular users see transactions for their own holdings. Admin users can see all transactions.

Setup:
Log in as `investor@example.com` and authorize Swagger.

Success Case:
1. Open `GET /api/transactions`.
2. Click `Execute`.
3. Expect `200 OK` with an array of transactions.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

## POST /api/transactions

Access Control: Holding owner or admin

Setup:
Log in as `investor@example.com`, run `GET /api/holdings`, and copy one owned holding ID.

Success Case:
1. Open `POST /api/transactions`.
2. Use the copied holding ID:
```json
{
  "holdingId": 1,
  "type": "BUY",
  "quantity": 3,
  "price": 320,
  "transactionDate": "2026-04-22T14:30:00.000Z"
}
```
3. Click `Execute`.
4. Expect `201 Created` with the created transaction.

400 Bad Request:
1. Set `type` to `HOLD` or set `quantity` to `-1`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` holding ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use `holdingId` `999999`.
3. Expect `404 Not Found`.

## GET /api/transactions/{id}

Access Control: Owner or admin

Setup:
Log in as `investor@example.com`, run `GET /api/transactions`, and copy one transaction ID.

Success Case:
1. Open `GET /api/transactions/{id}`.
2. Enter an owned transaction ID.
3. Click `Execute`.
4. Expect `200 OK` with transaction, holding, and portfolio data.

400 Bad Request:
1. Enter `-10`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` transaction ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

## PUT /api/transactions/{id}

Access Control: Owner or admin

Setup:
Log in as `investor@example.com` and copy one owned transaction ID from `GET /api/transactions`.

Success Case:
1. Open `PUT /api/transactions/{id}`.
2. Enter an owned transaction ID.
3. Use:
```json
{
  "type": "BUY",
  "quantity": 4,
  "price": 325,
  "transactionDate": "2026-04-22T15:30:00.000Z"
}
```
4. Click `Execute`.
5. Expect `200 OK` with the updated transaction.

400 Bad Request:
1. Set `quantity` to `-1`.
2. Click `Execute`.
3. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` transaction ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.

## DELETE /api/transactions/{id}

Access Control: Owner or admin

Setup:
Create a temporary transaction using `POST /api/transactions`, then copy its ID.

Success Case:
1. Open `DELETE /api/transactions/{id}`.
2. Enter the temporary transaction ID.
3. Click `Execute`.
4. Expect `204 No Content`.

400 Bad Request:
1. Enter `-10`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Logout from Swagger authorization.
2. Run the endpoint again.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Log in as `not-owner@example.com`.
2. Use an `investor@example.com` transaction ID.
3. Expect `403 Forbidden`.

404 Not Found:
1. Log in as `investor@example.com`.
2. Use ID `999999`.
3. Expect `404 Not Found`.
