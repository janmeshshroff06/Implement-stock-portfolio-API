# Render Deployment Guide

This project is configured for Render using `render.yaml`.

## Render Setup

1. Push the project to a GitHub repository.
2. In Render, choose `New` -> `Blueprint`.
3. Connect the GitHub repository.
4. Render will read `render.yaml` and create:
   - a Node web service named `stock-portfolio-api`
   - a PostgreSQL database named `stock-portfolio-db`
5. Confirm the generated environment variables:
   - `DATABASE_URL` comes from the Render PostgreSQL database
   - `JWT_SECRET` is generated automatically
   - `NODE_ENV` is set to `production`

## Render Commands

Build command:

```bash
npm install && npx prisma generate
```

Start command:

```bash
npx prisma migrate deploy && npx prisma db seed && npm start
```

The start command applies Prisma migrations and seeds the database automatically so sample data is available after deployment. This keeps the Blueprint compatible with Render free tier services, where `preDeployCommand` is not supported.

## Public URLs

After deployment, Render will provide a live URL similar to:

```text
https://stock-portfolio-api.onrender.com
```

Use these grading URLs:

```text
https://your-render-url.onrender.com/health
https://your-render-url.onrender.com/api-docs
https://your-render-url.onrender.com/openapi.json
```

## Seed Login Credentials

```text
admin@example.com / Password123!
investor@example.com / Password123!
not-owner@example.com / Password123!
```

Use `POST /api/auth/login` in Swagger UI to get a JWT, then click `Authorize` and paste the token.
