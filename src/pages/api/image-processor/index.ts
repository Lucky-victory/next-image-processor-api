import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { v4 as uuid } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 20,
};

interface ProcessedImage {
  filename: string;
  originalFilename: string;
  format: string;
  originalSize: number;
  newSize: number;
  url: string;
}

const processImage = async (
  processId: string,
  file: formidable.File,
  format: string,
  quality: number,
  width: number | undefined,
  height: number | undefined
): Promise<ProcessedImage> => {
  const imageBuffer = await sharp(file.filepath).toBuffer();
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

  const outputFilename = `compressed-${file.originalFilename?.replace(
    /\.[^/.]+$/,
    ""
  )}.${format}`;

  const processedBuffer = await sharpImage.toBuffer();
  const newSize = processedBuffer.length;

  const blob = await put(processId + "/" + outputFilename, processedBuffer, {
    access: "public",
    contentType: `image/${format}`,
  });

  return {
    filename: outputFilename,
    originalFilename: file.originalFilename as string,
    format,
    originalSize,
    newSize,
    url: blob.url,
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

    const processedImages = await Promise.all(
      imageFiles.map((file) =>
        processImage(id, file, format, quality, width, height)
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
