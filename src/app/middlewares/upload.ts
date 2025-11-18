import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const maxFileSize = 15000000;

const s3 = new S3Client({
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

const s3Storage = multerS3({
  s3,
  bucket: "synapse-call",
  metadata: (req, file, cb) => {
    cb(null, {...file});
  },
  acl: "public-read", // Tal vez cambiar a authenticated-read, habrá que ver
  key: (req, file, cb) => {
    const name = new Date().getTime().toString();
    const extension = file.originalname.split(".").pop();
    cb(null, `${name}.${extension}`);
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