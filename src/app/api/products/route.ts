import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct, Product } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, category, description, ingredients, benefits, image, stock, enabled } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Missing required product fields (name, price, category)" }, { status: 400 });
    }

    // Generate clean ID from name
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProduct: Product = {
      id,
      name,
      price: Number(price),
      category,
      description: description || "",
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      image: image || "/images/products/placeholder.jpg",
      rating: 5.0,
      reviewsCount: 0,
      stock: typeof stock === "number" ? stock : 20,
      enabled: typeof enabled === "boolean" ? enabled : true
    };

    await saveProduct(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
