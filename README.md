# Inventory Management API (TypeScript + Express + Prisma + SQLite)

A compact, backend-focused API showcasing robust inventory logic and clean structure.

## Features

- Products CRUD
- Stock operations: **increase** and **decrease** (with error on insufficient stock)
- Filter products that are **below low-stock threshold**
- Consistent error format
- Jest tests for core logic

## Tech

- TypeScript, Express
- Prisma ORM with SQLite (local dev friendly)
- Jest + Supertest

## Getting Started

```bash
# 1) Install deps
npm install

# 2) Generate Prisma client & create DB
npx prisma generate
npx prisma migrate dev --name init

# 3) Dev server
npm run dev
# API at http://localhost:3000
```

### Run tests
```bash
npm test
```

## API

### Create product
`POST /products`
```json
{
  "name": "Widget",
  "description": "A useful item",
  "stock_quantity": 10,
  "low_stock_threshold": 2
}
```

### List products
`GET /products?below_threshold=true&q=widget&page=1&pageSize=20`

### Get one
`GET /products/:id`

### Update
`PATCH /products/:id`

### Delete
`DELETE /products/:id`

### Increase stock
`POST /products/:id/stock/increase`
```json
{ "amount": 3 }
```

### Decrease stock
`POST /products/:id/stock/decrease`
```json
{ "amount": 2 }
```
- Returns **400** with code `INSUFFICIENT_STOCK` if you try to remove more than available.

### Error shape
```json
{ "error": { "code": "INSUFFICIENT_STOCK", "message": "Cannot decrease by 5; only 3 available." } }
```

## Notes

- For simplicity and portability, SQLite is used. Swap to Postgres by changing `datasource` in `prisma/schema.prisma` and setting `DATABASE_URL`, then run migrations.
- The "below_threshold" filter is performed in-memory due to SQLite's limited field-to-field comparison support in Prisma.
