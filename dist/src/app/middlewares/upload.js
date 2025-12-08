"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Storage = exports.s3Client = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const maxFileSize = 15000000;
exports.s3Client = new client_s3_1.S3Client({
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
exports.s3Storage = (0, multer_s3_1.default)({
    s3: exports.s3Client,
    bucket: "synapse-call",
    metadata: (req, file, cb) => {
        cb(null, { ...file });
    },
    acl: "public-read", // Tal vez cambiar a authenticated-read, habrá que ver
    key: (req, file, cb) => {
        const meetingId = req.params.id;
        const date = new Date().getTime().toString();
        const rawName = file.originalname.replace(/[^a-zA-Z0-9.()_-]/g, "_");
        const name = `${meetingId}---${date}---${rawName}`;
        cb(null, `${name}`);
    },
});
const fileFilter = (req, file, cb) => {
    const extension = file.originalname.split(".").pop();
    const ext = (extension || "").toLowerCase();
    const allowed = Object.values(validExtensions).flat().map(e => e.toLowerCase());
    if (allowed.includes(ext)) {
        return cb(null, true);
    }
    return cb(null, false);
};
const upload = (0, multer_1.default)({ storage: exports.s3Storage, fileFilter, limits: { fileSize: maxFileSize } });
exports.default = upload;
