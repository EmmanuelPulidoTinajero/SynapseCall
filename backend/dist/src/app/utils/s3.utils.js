"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllS3Keys = listAllS3Keys;
exports.getS3DownloadLink = getS3DownloadLink;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const upload_1 = require("../middlewares/upload");
async function listAllS3Keys(prefix) {
    const allKeys = [];
    let continuationToken;
    do {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: "synapse-call",
            ContinuationToken: continuationToken,
            Prefix: prefix
        });
        const response = await upload_1.s3Client.send(command);
        if (response.Contents) {
            for (const object of response.Contents) {
                if (object.Key) {
                    allKeys.push(object.Key);
                }
            }
        }
        continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    return allKeys;
}
async function getS3DownloadLink(keys) {
    const allLinks = [];
    for (const key of keys) {
        const parts = key.split("---");
        const filename = parts[parts.length - 1];
        const encodedFilename = encodeURIComponent(filename);
        const disposition = `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`;
        const command = new client_s3_1.GetObjectCommand({
            Bucket: "synapse-call",
            Key: key,
            ResponseContentDisposition: disposition
        });
        try {
            const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(upload_1.s3Client, command, { expiresIn: 3600 });
            allLinks.push({ key, url: presignedUrl });
        }
        catch (error) {
            console.error(`Failed to create presigned URL for key=${key}`, error);
            allLinks.push({ key, url: '' });
        }
    }
    return allLinks;
}
