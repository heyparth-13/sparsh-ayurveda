import { NextRequest, NextResponse } from "next/server";
import { getReviewsByProductId, saveReview, Review } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const reviews = await getReviewsByProductId(productId);
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userName, rating, comment } = body;

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newReview: Review = {
      id: `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      userName,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveReview(newReview);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
