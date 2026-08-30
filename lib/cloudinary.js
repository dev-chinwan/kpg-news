import { v2 as cloudinary } from "cloudinary";

let configured = false;

function hasCloudinaryEnv() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function isCloudinaryConfigured() {
  return hasCloudinaryEnv();
}

export function getCloudinaryClient() {
  if (!hasCloudinaryEnv()) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}
