import { mkdir } from "node:fs/promises";
import path from "node:path";
import multer from "multer";

export const uploadsDirectory = process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), "uploads");
export const profileImagesDirectory = path.join(uploadsDirectory, "profile-images");

await mkdir(profileImagesDirectory, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, profileImagesDirectory),
    filename: (_request, file, callback) => {
      const extension = file.mimetype === "image/png" ? ".png" : file.mimetype === "image/webp" ? ".webp" : ".jpg";
      callback(null, `${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error("Solo se permiten imágenes JPG, PNG o WebP."));
  },
});

export function profileImageUrl(filename: string): string {
  return `/uploads/profile-images/${filename}`;
}

export function filenameFromProfileImageUrl(url: string | null): string | null {
  if (!url) return null;
  const prefix = "/uploads/profile-images/";
  if (!url.startsWith(prefix)) return null;
  const filename = url.slice(prefix.length);
  return filename && path.basename(filename) === filename ? filename : null;
}
