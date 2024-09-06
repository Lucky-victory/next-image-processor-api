import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import ffmpeg from "fluent-ffmpeg";

export const config = {
  api: {
    bodyParser: false,
    size: 300 * 1024 * 1024, // 50MB
  },
};

interface ProcessedVideo {
  filename: string;
  format: string;
  originalSize: number;
  newSize: number;
}

const processVideo = async (
  file: formidable.File,
  format: string,
  quality: number,
  outputDir: string
): Promise<ProcessedVideo> => {
  const originalSize = (await fs.stat(file.filepath)).size;
  const outputFilename = `processed-${Date.now()}.${format}`;
  const outputPath = path.join(outputDir, outputFilename);

  return new Promise((resolve, reject) => {
    ffmpeg(file.filepath)
      .outputOptions([
        `-c:v libx264`,
        `-crf ${quality}`,
        `-preset slow`,
        `-c:a aac`,
        `-b:a 128k`,
      ])
      .toFormat(format)
      .on("end", async () => {
        const newSize = (await fs.stat(outputPath)).size;
        resolve({
          filename: outputFilename,
          format,
          originalSize,
          newSize,
        });
      })
      .on("error", (err: any) => {
        reject(err);
      })
      .save(outputPath);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let { q, f } = req.query as {
      q: string;
      f: string;
    };
    const form = formidable({ multiples: true });
    const [_, files] = await form.parse(req);

    const videoFiles = files.video as formidable.File[];
    if (!videoFiles || videoFiles.length === 0) {
      return res.status(400).json({ error: "No video files provided" });
    }

    const format = f || "mp4";
    const quality = Math.min(Math.max(parseInt(q || "23"), 0), 51); // CRF scale: 0-51, lower is better quality

    const id = uuid();
    const processedDir = path.join(process.cwd(), "public", "processed");
    const outputDir = path.join(processedDir, id);

    await fs.mkdir(outputDir, { recursive: true });

    const processedVideos = await Promise.all(
      videoFiles.map((file) => processVideo(file, format, quality, outputDir))
    );

    res.status(200).json({
      message: "Videos processed successfully",
      id: id,
      videos: processedVideos,
    });
  } catch (error) {
    console.error("Error processing videos:", error);
    res.status(500).json({ error: "Error processing videos" });
  }
}
