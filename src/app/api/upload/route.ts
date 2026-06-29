import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const filename = file.name || `favicon-${Date.now()}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
  const filePath = `uploads/${Date.now()}-${filename}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData, error: publicError } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (publicError) {
    return NextResponse.json({ error: publicError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicData.publicUrl });
}
