"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== SCHEMAS ====================

const productSchema = z.object({
  name: z.string().min(1, "שם המוצר חובה"),
  slug: z.string().min(1, "slug חובה"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  supplierUrl: z.string().url().optional().or(z.literal("")),
  supplierSku: z.string().optional(),
  basePrice: z.coerce.number().min(0, "מחיר חייב להיות חיובי"),
  costPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featured: z.coerce.boolean().default(false),
});

const variantSchema = z.object({
  name: z.string().min(1, "שם הוריאנט חובה"),
  sku: z.string().min(1, "SKU חובה"),
  priceOverride: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  stockStore: z.coerce.number().int().min(0).default(0),
  stockSupplier: z.coerce.number().int().min(0).default(0),
  stockStatus: z
    .enum(["IN_STOCK", "AT_SUPPLIER", "ON_ORDER", "OUT_OF_STOCK"])
    .default("IN_STOCK"),
  weight: z.coerce.number().min(0).optional(),
  isDefault: z.coerce.boolean().default(false),
});

// ==================== PRODUCTS ====================

export async function getProducts(opts?: {
  status?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = opts?.page || 1;
  const limit = opts?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (opts?.status) where.status = opts.status;
  if (opts?.categoryId) where.categoryId = opts.categoryId;
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { variants: { some: { sku: { contains: opts.search, mode: "insensitive" } } } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getProduct(id: string) {
  return db.product.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      supplier: true,
      variants: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      groupPrices: { include: { group: true } },
      crossSellFrom: { include: { relatedProduct: { include: { images: { take: 1 } } } } },
    },
  });
}

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.parse(raw);

  const product = await db.product.create({
    data: {
      ...parsed,
      supplierUrl: parsed.supplierUrl || null,
      costPrice: parsed.costPrice || null,
      seoTitle: parsed.seoTitle || null,
      seoDescription: parsed.seoDescription || null,
      categoryId: parsed.categoryId || null,
      supplierId: parsed.supplierId || null,
      supplierSku: parsed.supplierSku || null,
      description: parsed.description || null,
    },
  });

  await db.auditLog.create({
    data: {
      actor: "admin",
      action: "product.created",
      entityType: "product",
      entityId: product.id,
      data: { name: product.name },
    },
  });

  revalidatePath("/admin/products");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.parse(raw);

  const product = await db.product.update({
    where: { id },
    data: {
      ...parsed,
      supplierUrl: parsed.supplierUrl || null,
      costPrice: parsed.costPrice || null,
      seoTitle: parsed.seoTitle || null,
      seoDescription: parsed.seoDescription || null,
      categoryId: parsed.categoryId || null,
      supplierId: parsed.supplierId || null,
      supplierSku: parsed.supplierSku || null,
      description: parsed.description || null,
    },
  });

  await db.auditLog.create({
    data: {
      actor: "admin",
      action: "product.updated",
      entityType: "product",
      entityId: product.id,
      data: { name: product.name },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/products/${product.slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actor: "admin",
      action: "product.deleted",
      entityType: "product",
      entityId: id,
      data: { name: product.name },
    },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

// ==================== VARIANTS ====================

export async function addVariant(productId: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = variantSchema.parse(raw);

  const maxSort = await db.variant.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  const variant = await db.variant.create({
    data: {
      productId,
      ...parsed,
      priceOverride: parsed.priceOverride || null,
      costPrice: parsed.costPrice || null,
      weight: parsed.weight || null,
      sortOrder: (maxSort._max.sortOrder || 0) + 1,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { success: true, id: variant.id };
}

export async function updateVariant(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = variantSchema.parse(raw);

  const variant = await db.variant.update({
    where: { id },
    data: {
      ...parsed,
      priceOverride: parsed.priceOverride || null,
      costPrice: parsed.costPrice || null,
      weight: parsed.weight || null,
    },
  });

  revalidatePath(`/admin/products/${variant.productId}`);
  return { success: true };
}

export async function deleteVariant(id: string) {
  const variant = await db.variant.delete({ where: { id } });
  revalidatePath(`/admin/products/${variant.productId}`);
  return { success: true };
}

// ==================== CATEGORIES ====================

export async function getCategories() {
  return db.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const image = (formData.get("image") as string) || null;

  await db.category.create({ data: { name, slug, parentId, image } });
  revalidatePath("/admin/categories");
  return { success: true };
}

// ==================== SUPPLIERS ====================

export async function getSuppliers() {
  return db.supplier.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}
