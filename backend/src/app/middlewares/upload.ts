import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { S3, S3Client } from "@aws-sdk/client-s3";

const maxFileSize = 15000000;

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || ""
  }
});

const validExtensions = {
  "images": ["jpg", "jpeg", "png"],
  "docs": ["doc", "docx", "pdf"],
  "compressed": ["zip", "rar"]
};

export const s3Storage = multerS3({
  s3: s3Client,
  bucket: "synapse-call",
  metadata: (req, file, cb) => {
    cb(null, {...file});
  },
  acl: "public-read", // Tal vez cambiar a authenticated-read, habrá que ver
  key: (req: Request, file ,cb) => {
    const meetingId = req.params.id;
    const date = new Date().getTime().toString();
    const rawName = file.originalname.replace(/[^a-zA-Z0-9.()_-]/g, "_");
    const name = `${meetingId}---${date}---${rawName}`;
    cb(null, `${name}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const extension = file.originalname.split(".").pop();
  const ext = (extension || "").toLowerCase();
  const allowed = Object.values(validExtensions).flat().map(e => e.toLowerCase());

  if (allowed.includes(ext)) {
    return cb(null, true);
  }

  return cb(null, false);
};

const upload = multer({ storage: s3Storage, fileFilter, limits: {fileSize: maxFileSize} });

export default upload;