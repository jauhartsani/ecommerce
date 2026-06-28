import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServerClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

async function checkAuth() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const admin = createAdminClient();
  const payload: Database["public"]["Tables"]["products"]["Insert"] = {
    name: body.name,
    slug: body.slug,
    price: body.price,
    original_price: body.original_price ?? null,
    description: body.description ?? null,
    long_description: body.long_description ?? null,
    image_url: body.image_url ?? null,
    gallery_urls: body.gallery_urls ?? null,
    category: body.category ?? null,
    is_active: body.is_active ?? true,
    is_featured: body.is_featured ?? false,
    is_flash_sale: body.is_flash_sale ?? false,
    stock: body.stock ?? 0,
    sold_count: body.sold_count ?? 0,
  };

  const { data, error } = await admin.from("products").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
