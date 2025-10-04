import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/prisma";

beforeAll(async () => {
  await prisma.$connect();
  await prisma.product.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Products CRUD and inventory ops", () => {
  let id: string;

  it("creates a product", async () => {
    const res = await request(app).post("/products").send({
      name: "Widget",
      description: "A very useful widget",
      stock_quantity: 2,
      low_stock_threshold: 5
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Widget");
    id = res.body.id;
  });

  it("lists products", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("gets one product", async () => {
    const res = await request(app).get(`/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it("increases stock", async () => {
    const res = await request(app).post(`/products/${id}/stock/increase`).send({ amount: 3 });
    expect(res.status).toBe(200);
    expect(res.body.stock_quantity).toBe(5);
  });

  it("decreases stock successfully", async () => {
    const res = await request(app).post(`/products/${id}/stock/decrease`).send({ amount: 2 });
    expect(res.status).toBe(200);
    expect(res.body.stock_quantity).toBe(3);
  });

  it("fails to decrease beyond available", async () => {
    const res = await request(app).post(`/products/${id}/stock/decrease`).send({ amount: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("filters below threshold", async () => {
    const res = await request(app).get(`/products?below_threshold=true`);
    expect(res.status).toBe(200);
    // Widget has stock 3, threshold 5 -> should appear
    const found = res.body.find((p: any) => p.id === id);
    expect(found).toBeTruthy();
  });

  it("updates product (reject negative stock)", async () => {
    const res = await request(app).patch(`/products/${id}`).send({ stock_quantity: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("deletes a product", async () => {
    const res = await request(app).delete(`/products/${id}`);
    expect(res.status).toBe(204);
  });
});
