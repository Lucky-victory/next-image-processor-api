import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ProcessedImage {
  filename: string;
  format: string;
  width: number;
  height: number;
  originalSize: number;
  newSize: number;
}

const processImage = async (
  file: formidable.File,
  width: number,
  height: number,
  format: string,
  quality: number
): Promise<ProcessedImage> => {
  const imageBuffer = await fs.readFile(file.filepath);
  const originalSize = imageBuffer.length;
  let sharpImage = sharp(imageBuffer);

  // Resize the image
  if (width || height) {
    sharpImage = sharpImage.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Set the output format and quality
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

  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputFilename);

  // Create the 'processed' directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  await sharpImage.toFile(outputPath);

  const { width: finalWidth, height: finalHeight } =
    await sharpImage.metadata();

  const newSize = (await fs.stat(outputPath)).size;

  return {
    filename: outputFilename,
    format,
    width: finalWidth || 0,
    height: finalHeight || 0,
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
    const form = formidable({ multiples: true });
    const [fields, files] = await form.parse(req);

    const imageFiles = files.image as formidable.File[];
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const width = parseInt(fields.width?.[0] || "0");
    const height = parseInt(fields.height?.[0] || "0");
    const format = fields.format?.[0] || "jpeg";
    const quality = Math.min(
      Math.max(parseInt(fields.quality?.[0] || "80"), 1),
      100
    );

    const processedImages = await Promise.all(
      imageFiles.map((file) =>
        processImage(file, width, height, format, quality)
      )
    );

    res.status(200).json({
      message: "Images processed successfully",
      images: processedImages,
    });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Error processing images" });
  }
}
