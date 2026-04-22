export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Stock Portfolio & Transaction API",
    version: "1.0.0",
    description:
      "REST API for user authentication, portfolio management, holdings, and stock transaction tracking.",
  },
  servers: [
    {
      url: "/",
      description: "Current server",
    },
  ],
  tags: [
    { name: "Health", description: "Basic API status checks" },
    { name: "Authentication", description: "Signup and login endpoints" },
    { name: "Portfolios", description: "Portfolio CRUD operations" },
    { name: "Holdings", description: "Holding CRUD operations" },
    { name: "Transactions", description: "Transaction CRUD operations" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Error message" },
        },
        required: ["error"],
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
        },
        required: ["status"],
      },
      SignupRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "test@example.com" },
          password: { type: "string", format: "password", example: "password123" },
        },
        required: ["email", "password"],
      },
      SignupResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", format: "email", example: "test@example.com" },
          role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
          createdAt: { type: "string", format: "date-time", example: "2026-04-21T02:22:53.799Z" },
        },
        required: ["id", "email", "role", "createdAt"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "test@example.com" },
          password: { type: "string", format: "password", example: "password123" },
        },
        required: ["email", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.payload.signature",
          },
        },
        required: ["token"],
      },
      Portfolio: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          name: { type: "string", example: "Long-Term Portfolio" },
          description: { type: "string", nullable: true, example: "My main investments" },
          createdAt: { type: "string", format: "date-time", example: "2026-04-21T02:30:00.000Z" },
        },
        required: ["id", "userId", "name", "createdAt"],
      },
      PortfolioCreateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Long-Term Portfolio" },
          description: { type: "string", example: "My main investments" },
        },
        required: ["name"],
      },
      PortfolioUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Updated Portfolio" },
          description: { type: "string", nullable: true, example: "Updated notes" },
        },
      },
      PortfolioSummary: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          name: { type: "string", example: "Long-Term Portfolio" },
          createdAt: { type: "string", format: "date-time", example: "2026-04-21T02:30:00.000Z" },
        },
        required: ["id", "userId", "name", "createdAt"],
      },
      PortfolioPerformanceSummary: {
        type: "object",
        properties: {
          totalValue: { type: "number", example: 12000 },
          totalInvestment: { type: "number", example: 10000 },
          profitLoss: { type: "number", example: 2000 },
        },
        required: ["totalValue", "totalInvestment", "profitLoss"],
      },
      Holding: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          portfolioId: { type: "integer", example: 1 },
          symbol: { type: "string", example: "AAPL" },
          totalShares: { type: "number", example: 50 },
          avgPrice: { type: "number", example: 150.25 },
          createdAt: { type: "string", format: "date-time", example: "2026-04-21T02:35:00.000Z" },
        },
        required: ["id", "portfolioId", "symbol", "totalShares", "avgPrice", "createdAt"],
      },
      HoldingWithPortfolio: {
        allOf: [
          { $ref: "#/components/schemas/Holding" },
          {
            type: "object",
            properties: {
              portfolio: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  name: { type: "string", example: "Long-Term Portfolio" },
                  userId: { type: "integer", example: 1 },
                },
              },
            },
          },
        ],
      },
      HoldingCreateRequest: {
        type: "object",
        properties: {
          portfolioId: { type: "integer", example: 1 },
          symbol: { type: "string", example: "AAPL" },
          totalShares: { type: "number", example: 50 },
          avgPrice: { type: "number", example: 150.25 },
        },
        required: ["portfolioId", "symbol", "totalShares", "avgPrice"],
      },
      HoldingUpdateRequest: {
        type: "object",
        properties: {
          symbol: { type: "string", example: "TSLA" },
          totalShares: { type: "number", example: 75 },
          avgPrice: { type: "number", example: 155.5 },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          holdingId: { type: "integer", example: 1 },
          type: { type: "string", enum: ["BUY", "SELL"], example: "BUY" },
          quantity: { type: "number", example: 10 },
          price: { type: "number", example: 155 },
          transactionDate: {
            type: "string",
            format: "date-time",
            example: "2026-04-21T02:40:00.000Z",
          },
        },
        required: ["id", "holdingId", "type", "quantity", "price", "transactionDate"],
      },
      TransactionWithHolding: {
        allOf: [
          { $ref: "#/components/schemas/Transaction" },
          {
            type: "object",
            properties: {
              holding: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  symbol: { type: "string", example: "AAPL" },
                  portfolioId: { type: "integer", example: 1 },
                },
              },
            },
          },
        ],
      },
      TransactionCreateRequest: {
        type: "object",
        properties: {
          holdingId: { type: "integer", example: 1 },
          type: { type: "string", enum: ["BUY", "SELL"], example: "BUY" },
          quantity: { type: "number", example: 10 },
          price: { type: "number", example: 155 },
          transactionDate: {
            type: "string",
            format: "date-time",
            example: "2026-04-21T02:40:00.000Z",
          },
        },
        required: ["holdingId", "type", "quantity", "price", "transactionDate"],
      },
      TransactionUpdateRequest: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["BUY", "SELL"], example: "SELL" },
          quantity: { type: "number", example: 5 },
          price: { type: "number", example: 160 },
          transactionDate: {
            type: "string",
            format: "date-time",
            example: "2026-04-22T09:30:00.000Z",
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        security: [],
        responses: {
          200: {
            description: "Server is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create a new user account",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
              example: {
                email: "test@example.com",
                password: "password123",
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignupResponse" },
                example: {
                  id: 1,
                  email: "test@example.com",
                  role: "USER",
                  createdAt: "2026-04-21T02:22:53.799Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate a user and return a JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "test@example.com",
                password: "password123",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
                example: {
                  token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.payload.signature",
                },
              },
            },
          },
          400: {
            description: "Missing email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/portfolios": {
      get: {
        tags: ["Portfolios"],
        summary: "Retrieve portfolios for the authenticated user",
        responses: {
          200: {
            description: "Portfolio list returned",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PortfolioSummary" },
                },
                example: [
                  {
                    id: 1,
                    userId: 1,
                    name: "Long-Term Portfolio",
                    description: "My main investments",
                    createdAt: "2026-04-21T02:30:00.000Z",
                  },
                ],
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Portfolios"],
        summary: "Create a portfolio",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PortfolioCreateRequest" },
              example: {
                name: "Long-Term Portfolio",
                description: "My main investments",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Portfolio created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Portfolio" },
                example: {
                  id: 1,
                  userId: 1,
                  name: "Long-Term Portfolio",
                  description: "My main investments",
                  createdAt: "2026-04-21T02:30:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/portfolios/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      ],
      get: {
        tags: ["Portfolios"],
        summary: "Get a portfolio by ID",
        responses: {
          200: {
            description: "Portfolio returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Portfolio" },
                example: {
                  id: 1,
                  userId: 1,
                  name: "Long-Term Portfolio",
                  description: "My main investments",
                  createdAt: "2026-04-21T02:30:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Invalid portfolio ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Portfolio not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Portfolios"],
        summary: "Update a portfolio",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PortfolioUpdateRequest" },
              example: {
                name: "Updated Portfolio",
                description: "Updated notes",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Portfolio updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Portfolio" },
                example: {
                  id: 1,
                  userId: 1,
                  name: "Updated Portfolio",
                  description: "Updated notes",
                  createdAt: "2026-04-21T02:30:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Portfolio not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Portfolios"],
        summary: "Delete a portfolio",
        responses: {
          204: {
            description: "Portfolio deleted successfully",
          },
          400: {
            description: "Invalid portfolio ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Portfolio not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/portfolios/{id}/summary": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      ],
      get: {
        tags: ["Portfolios"],
        summary: "Get portfolio performance summary",
        responses: {
          200: {
            description: "Portfolio summary returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PortfolioPerformanceSummary" },
                example: {
                  totalValue: 12000,
                  totalInvestment: 10000,
                  profitLoss: 2000,
                },
              },
            },
          },
          400: {
            description: "Invalid portfolio ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Portfolio not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/holdings": {
      get: {
        tags: ["Holdings"],
        summary: "Retrieve holdings for the authenticated user",
        responses: {
          200: {
            description: "Holding list returned",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HoldingWithPortfolio" },
                },
                example: [
                  {
                    id: 1,
                    portfolioId: 1,
                    symbol: "AAPL",
                    totalShares: 50,
                    avgPrice: 150.25,
                    createdAt: "2026-04-21T02:35:00.000Z",
                    portfolio: {
                      id: 1,
                      name: "Long-Term Portfolio",
                      userId: 1,
                    },
                  },
                ],
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Holdings"],
        summary: "Create a holding",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HoldingCreateRequest" },
              example: {
                portfolioId: 1,
                symbol: "AAPL",
                totalShares: 50,
                avgPrice: 150.25,
              },
            },
          },
        },
        responses: {
          201: {
            description: "Holding created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Holding" },
                example: {
                  id: 1,
                  portfolioId: 1,
                  symbol: "AAPL",
                  totalShares: 50,
                  avgPrice: 150.25,
                  createdAt: "2026-04-21T02:35:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Portfolio not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/holdings/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      ],
      get: {
        tags: ["Holdings"],
        summary: "Get a holding by ID",
        responses: {
          200: {
            description: "Holding returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HoldingWithPortfolio" },
                example: {
                  id: 1,
                  portfolioId: 1,
                  symbol: "AAPL",
                  totalShares: 50,
                  avgPrice: 150.25,
                  createdAt: "2026-04-21T02:35:00.000Z",
                  portfolio: {
                    id: 1,
                    userId: 1,
                    name: "Long-Term Portfolio",
                    description: "My main investments",
                    createdAt: "2026-04-21T02:30:00.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid holding ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Holding not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Holdings"],
        summary: "Update a holding",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HoldingUpdateRequest" },
              example: {
                symbol: "TSLA",
                totalShares: 75,
                avgPrice: 155.5,
              },
            },
          },
        },
        responses: {
          200: {
            description: "Holding updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Holding" },
                example: {
                  id: 1,
                  portfolioId: 1,
                  symbol: "TSLA",
                  totalShares: 75,
                  avgPrice: 155.5,
                  createdAt: "2026-04-21T02:35:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Holding not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Holdings"],
        summary: "Delete a holding",
        responses: {
          204: {
            description: "Holding deleted successfully",
          },
          400: {
            description: "Invalid holding ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Holding not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "Retrieve transactions for the authenticated user",
        responses: {
          200: {
            description: "Transaction list returned",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TransactionWithHolding" },
                },
                example: [
                  {
                    id: 1,
                    holdingId: 1,
                    type: "BUY",
                    quantity: 10,
                    price: 155,
                    transactionDate: "2026-04-21T02:40:00.000Z",
                    holding: {
                      id: 1,
                      symbol: "AAPL",
                      portfolioId: 1,
                    },
                  },
                ],
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Transactions"],
        summary: "Create a transaction",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransactionCreateRequest" },
              example: {
                holdingId: 1,
                type: "BUY",
                quantity: 10,
                price: 155,
                transactionDate: "2026-04-21T02:40:00.000Z",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Transaction created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Transaction" },
                example: {
                  id: 1,
                  holdingId: 1,
                  type: "BUY",
                  quantity: 10,
                  price: 155,
                  transactionDate: "2026-04-21T02:40:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid transaction data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Holding not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/transactions/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      ],
      get: {
        tags: ["Transactions"],
        summary: "Get a transaction by ID",
        responses: {
          200: {
            description: "Transaction returned",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Transaction" },
                    {
                      type: "object",
                      properties: {
                        holding: {
                          allOf: [
                            { $ref: "#/components/schemas/Holding" },
                            {
                              type: "object",
                              properties: {
                                portfolio: { $ref: "#/components/schemas/Portfolio" },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                example: {
                  id: 1,
                  holdingId: 1,
                  type: "BUY",
                  quantity: 10,
                  price: 155,
                  transactionDate: "2026-04-21T02:40:00.000Z",
                  holding: {
                    id: 1,
                    portfolioId: 1,
                    symbol: "AAPL",
                    totalShares: 50,
                    avgPrice: 150.25,
                    createdAt: "2026-04-21T02:35:00.000Z",
                    portfolio: {
                      id: 1,
                      userId: 1,
                      name: "Long-Term Portfolio",
                      description: "My main investments",
                      createdAt: "2026-04-21T02:30:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid transaction ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Transaction not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Transactions"],
        summary: "Update a transaction",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransactionUpdateRequest" },
              example: {
                type: "SELL",
                quantity: 5,
                price: 160,
                transactionDate: "2026-04-22T09:30:00.000Z",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Transaction updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Transaction" },
                example: {
                  id: 1,
                  holdingId: 1,
                  type: "SELL",
                  quantity: 5,
                  price: 160,
                  transactionDate: "2026-04-22T09:30:00.000Z",
                },
              },
            },
          },
          400: {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Transaction not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Transactions"],
        summary: "Delete a transaction",
        responses: {
          204: {
            description: "Transaction deleted successfully",
          },
          400: {
            description: "Invalid transaction ID format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Transaction not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};
