import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { validateUploadFile } from "@/lib/uploadValidation";
import { getCloudinaryClient, isCloudinaryConfigured } from "@/lib/cloudinary";
import { ADMIN_ROLE } from "@/lib/adminSession";

export async function POST(request) {
  const authError = requireAdminAuth(request, { minRole: ADMIN_ROLE });
  if (authError) return authError;

  const limited = enforceRateLimit(request, {
    routeKey: "admin-ui-content-logo-post",
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Cloudinary is not configured. Add CLOUDINARY_* variables first." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const logo = formData.get("logo");

    if (!(logo instanceof File) || logo.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Logo image file is required." },
        { status: 400 }
      );
    }

    const validation = validateUploadFile(logo, "image");
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.error },
        { status: 400 }
      );
    }

    const cloudinary = getCloudinaryClient();
    const bytes = await logo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "news-portal/media/logo",
          public_id: `site-logo-${Date.now()}`,
          resource_type: "image",
          overwrite: true,
          invalidate: true,
          tags: ["site-logo"],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      ok: true,
      logoUrl: uploaded?.secure_url || "",
      width: Number(uploaded?.width || 0),
      height: Number(uploaded?.height || 0),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Logo upload failed." },
      { status: 500 }
    );
  }
}
