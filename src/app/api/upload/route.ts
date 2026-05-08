import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { isAdminAuthenticated } from "@/lib/admin";
import { put } from "@vercel/blob";
import sharp from "sharp";

function isHeic(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const raw = Buffer.from(await file.arrayBuffer() as ArrayBuffer);
  let uploadBuffer: Buffer | Uint8Array = raw;
  let filename = file.name;
  let contentType = file.type;

  if (isHeic(file)) {
    uploadBuffer = await sharp(raw).jpeg({ quality: 90 }).toBuffer();
    filename = filename.replace(/\.(heic|heif)$/i, ".jpg");
    contentType = "image/jpeg";
  }

  const blob = await put(`products/${Date.now()}-${filename}`, uploadBuffer, {
    access: "public",
    contentType,
  });

  return NextResponse.json({ url: blob.url });
}
