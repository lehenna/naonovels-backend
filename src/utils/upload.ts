import sharp from "sharp";
import fs from "fs/promises";
import { createReadStream, ReadStream } from "fs";
import path from "path";

import { APIError } from "@/lib/error";

const UPLOAD_FOLDER = path.join(process.cwd(), "public/uploads");

async function optimize(inputBuffer: Uint8Array<ArrayBufferLike>) {
  try {
    const outputBuffer = await sharp(inputBuffer)
      .png({
        quality: 80,
        compressionLevel: 7,
      })
      .toBuffer();
    return outputBuffer;
  } catch {
    throw new APIError(500, "Error optimizing images.");
  }
}

export async function upload(name: string, file: File) {
  const bytes = await file.bytes();
  const data = await optimize(bytes);
  const filePath = path.join(UPLOAD_FOLDER, name);
  await fs.writeFile(filePath, data);
}

export async function removeUpload(name: string) {
  const filePath = path.join(UPLOAD_FOLDER, name);
  await fs.unlink(filePath);
}

function nodeToWebReadable(nodeReadable: ReadStream) {
  return new ReadableStream({
    start(controller) {
      nodeReadable.on("data", (chunk) => controller.enqueue(chunk));
      nodeReadable.on("end", () => controller.close());
      nodeReadable.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeReadable.destroy();
    },
  });
}

export async function getUpload(name: string) {
  const filePath = path.join(UPLOAD_FOLDER, name);
  const existsPath = await fs.exists(filePath);
  if (!existsPath) return null;
  const readStream = createReadStream(filePath);
  return nodeToWebReadable(readStream);
}
