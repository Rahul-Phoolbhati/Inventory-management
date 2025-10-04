import { prisma } from "../prisma";
import { ApiError } from "../types";

export async function createProduct(input: {
  name: string;
  description: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
}) {
  try {
    return await prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        stock_quantity: input.stock_quantity ?? 0,
        low_stock_threshold: input.low_stock_threshold ?? 0
      }
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      throw new ApiError(400, "DUPLICATE_NAME", "A product with this name already exists.");
    }
    throw e;
  }
}

export async function getProduct(id: string) {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) throw new ApiError(404, "NOT_FOUND", "Product not found.");
  return p;
}

export async function listProducts(opts: { q?: string; below_threshold?: boolean; page?: number; pageSize?: number } = {}) {
  const { q, below_threshold, page = 1, pageSize = 20 } = opts;
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q} },
      { description: { contains: q} }
    ];
  }
  if (below_threshold) {
    where.AND = [
      ...(where.AND || []),
      { stock_quantity: { lt: prisma.product.fields.low_stock_threshold } } // unsupported; use raw filter
    ];
  }

  const products = await prisma.product.findMany({
    where: q ? where : undefined,
    orderBy: { created_at: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  // if (below_threshold) {
  //   return products.filter(p => p.stock_quantity < p.low_stock_threshold);
  // }
  return products;
}

export async function updateProduct(id: string, patch: Partial<{ name: string; description: string; stock_quantity: number; low_stock_threshold: number }>) {
  if (patch.stock_quantity != null && patch.stock_quantity < 0) {
    throw new ApiError(400, "NEGATIVE_STOCK", "stock_quantity cannot be negative.");
  }
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: patch
    });
    return updated;
  } catch (e: any) {
    if (e.code === "P2025") throw new ApiError(404, "NOT_FOUND", "Product not found.");
    if (e.code === "P2002") throw new ApiError(400, "DUPLICATE_NAME", "A product with this name already exists.");
    throw e;
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") throw new ApiError(404, "NOT_FOUND", "Product not found.");
    throw e;
  }
}

export async function increaseStock(id: string, amount: number) {
  if (amount <= 0) throw new ApiError(400, "INVALID_AMOUNT", "Amount must be a positive integer.");
  const product = await prisma.product.update({
    where: { id },
    data: { stock_quantity: { increment: amount } }
  }).catch((e: any) => {
    if (e.code === "P2025") throw new ApiError(404, "NOT_FOUND", "Product not found.");
    throw e;
  });
  return product;
}

export async function decreaseStock(id: string, amount: number) {
  if (amount <= 0) throw new ApiError(400, "INVALID_AMOUNT", "Amount must be a positive integer.");
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) throw new ApiError(404, "NOT_FOUND", "Product not found.");
  if (p.stock_quantity - amount < 0) {
    throw new ApiError(400, "INSUFFICIENT_STOCK", `Cannot decrease by ${amount}; only ${p.stock_quantity} available.`);
  }
  const updated = await prisma.product.update({
    where: { id },
    data: { stock_quantity: { decrement: amount } }
  });
  return updated;
}
