import { S3, GetObjectCommand, ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../middlewares/upload";
import { all } from "axios";

export async function listAllS3Keys(prefix: string): Promise<string[]> {
      const allKeys: string[] = [];
      let continuationToken: string | undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: "synapse-call",
          ContinuationToken: continuationToken,
          Prefix: prefix
        });

        const response = await s3Client.send(command);

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

export type S3Link = { key: string; url: string };

export async function getS3DownloadLink(keys: string[]): Promise<S3Link[]> {
  const allLinks: S3Link[] = [];

  for (const key of keys) {
    const parts = key.split("---");
    const filename = parts[parts.length - 1];
    const encodedFilename = encodeURIComponent(filename);
    const disposition = `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`;

    const command = new GetObjectCommand({
      Bucket: "synapse-call",
      Key: key,
      ResponseContentDisposition: disposition
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      allLinks.push({ key, url: presignedUrl });
    } catch (error) {
      console.error(`Failed to create presigned URL for key=${key}`, error);
      allLinks.push({ key, url: '' });
    }
  }

  return allLinks;
}