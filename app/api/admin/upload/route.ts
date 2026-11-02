import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { getAdminUsername } from "@/lib/admin/session"
import { createAdminClient, MEDIA_BUCKET } from "@/lib/admin/supabase-admin"

const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

export async function POST(request: Request) {
  if (!(await getAdminUsername())) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 })

  const extension = ALLOWED[file.type]
  if (!extension) {
    return NextResponse.json({ error: "Use a PNG, JPG, WebP, GIF or AVIF image." }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 4 MB." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const path = `uploads/${new Date().getFullYear()}/${randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: "31536000" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
