import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { orderSchema } from "@/lib/validations";
import { generateOrderId } from "@/lib/utils";
import type { Database } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Allow product_id from body (product page sets it directly)
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const supabase = createAdminClient();

    const { data: product, error: productError } = await supabase
      .from("products").select("name, price").eq("id", data.product_id).eq("is_active", true).single();
    if (productError || !product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const orderId = generateOrderId();
    const payload: Database["public"]["Tables"]["orders"]["Insert"] = {
      order_id: orderId,
      name: data.name,
      whatsapp: data.whatsapp,
      email: data.email || null,
      address: data.address,
      product_id: data.product_id,
      product_name: product.name,
      quantity: body.quantity || data.quantity,
      notes: data.notes || null,
      status: "baru",
    };
    const { error } = await supabase.from("orders").insert(payload);
    if (error) return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
    return NextResponse.json({ success: true, orderId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") query = query.eq("status", status);
    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({ data, count, page, limit });
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
