import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export const config = {
  api: {
    bodyParser: false,size: 10 * 1024 * 1024, // 10MB
  },
};

interface ProcessedImage {
  filename: string;
  format: string;
  originalSize: number;
  newSize: number;
}

const processImage = async (
  file: formidable.File,
  format: string,
  quality: number,
  width: number | undefined,
  height: number | undefined,
  outputDir: string
): Promise<ProcessedImage> => {
  const imageBuffer = await fs.readFile(file.filepath);
  const originalSize = imageBuffer.length;
  let sharpImage = sharp(imageBuffer);

  if (width || height) {
    sharpImage = sharpImage.resize(width, height);
  }

  switch (format.toLowerCase()) {
    case "jpeg":
    case "jpg":
      sharpImage = sharpImage.jpeg({ quality });
      break;
    case "png":
      sharpImage = sharpImage.png({ quality: quality });
      break;
    case "webp":
      sharpImage = sharpImage.webp({ quality });
      break;
    default:
      throw new Error("Unsupported format");
  }

  const outputFilename = `processed-${Date.now()}.${format}`;
  const outputPath = path.join(outputDir, outputFilename);

  await sharpImage.toFile(outputPath);

  const newSize = (await fs.stat(outputPath)).size;

  return {
    filename: outputFilename,
    format,
    originalSize,
    newSize,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let { q, w, h, f } = req.query as {
      q: string;
      w: string;
      h: string;
      f: string;
    };
    const form = formidable({ multiples: true });
    const [_, files] = await form.parse(req);

    const imageFiles = files.image as formidable.File[];
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const format = f || "jpeg";
    const quality = Math.min(Math.max(parseInt(q || "70"), 1), 100);
    const width = w ? parseInt(w) : undefined;
    const height = h ? parseInt(h) : undefined;

    const id = uuid();
    const processedDir = path.join(process.cwd(), "public", "processed");
    const outputDir = path.join(processedDir, id);

    // Create the 'processed' directory and the id-based subdirectory if they don't exist
    await fs.mkdir(outputDir, { recursive: true });

    const processedImages = await Promise.all(
      imageFiles.map((file) =>
        processImage(file, format, quality, width, height, outputDir)
      )
    );

    res.status(200).json({
      message: "Images processed successfully",
      id: id,
      images: processedImages,
    });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Error processing images" });
  }
}
