const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function bytesToMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function getUploadLimits() {
  return {
    maxImageBytes: parsePositiveInt(
      process.env.MAX_IMAGE_UPLOAD_BYTES,
      DEFAULT_MAX_IMAGE_BYTES
    ),
    maxVideoBytes: parsePositiveInt(
      process.env.MAX_VIDEO_UPLOAD_BYTES,
      DEFAULT_MAX_VIDEO_BYTES
    ),
  };
}

export function validateUploadFile(file, kind = "image") {
  if (!(file instanceof File)) {
    return { ok: false, error: "Invalid upload payload." };
  }

  const type = String(file.type || "").toLowerCase();
  const { maxImageBytes, maxVideoBytes } = getUploadLimits();

  if (kind === "image") {
    if (!ALLOWED_IMAGE_TYPES.has(type)) {
      return {
        ok: false,
        error: "Only JPG, PNG, WEBP, and GIF images are allowed.",
      };
    }

    if (file.size > maxImageBytes) {
      return {
        ok: false,
        error: `Image is too large. Max ${bytesToMb(maxImageBytes)} MB allowed.`,
      };
    }
  }

  if (kind === "video") {
    if (!ALLOWED_VIDEO_TYPES.has(type)) {
      return {
        ok: false,
        error: "Only MP4, WEBM, and MOV videos are allowed.",
      };
    }

    if (file.size > maxVideoBytes) {
      return {
        ok: false,
        error: `Video is too large. Max ${bytesToMb(maxVideoBytes)} MB allowed.`,
      };
    }
  }

  return { ok: true, error: "" };
}
