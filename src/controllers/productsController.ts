import { Request, Response } from "express";
import * as service from "../services/productsService";
import { createProductSchema, updateProductSchema, stockOpSchema } from "../validators/productSchemas";

export async function create(req: Request, res: Response) {
  const parsed = createProductSchema.parse(req.body);
  const p = await service.createProduct(parsed);
  res.status(201).json(p);
}

export async function getOne(req: Request, res: Response) {
  const p = await service.getProduct(req.params.id);
  res.json(p);
}

export async function list(req: Request, res: Response) {
  const { q, below_threshold, page, pageSize } = req.query;
  const items = await service.listProducts({
    q: q ? String(q) : undefined,
    below_threshold: below_threshold === "true",
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  });
  res.json(items);
}

export async function update(req: Request, res: Response) {
  const patch = updateProductSchema.parse(req.body);
  const p = await service.updateProduct(req.params.id, patch);
  res.json(p);
}

export async function remove(req: Request, res: Response) {
  await service.deleteProduct(req.params.id);
  res.status(204).send();
}

export async function increase(req: Request, res: Response) {
  const { amount } = stockOpSchema.parse(req.body);
  const p = await service.increaseStock(req.params.id, amount);
  res.json(p);
}

export async function decrease(req: Request, res: Response) {
  const { amount } = stockOpSchema.parse(req.body);
  const p = await service.decreaseStock(req.params.id, amount);
  res.json(p);
}
