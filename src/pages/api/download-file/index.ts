import { NextApiRequest, NextApiResponse } from "next";
import { list, type ListBlobResultBlob } from "@vercel/blob";
import axios from "axios";

async function fetchImageUrl(
  processId: string,
  filename: string
): Promise<ListBlobResultBlob | undefined | null> {
  const { blobs } = await list({
    prefix: `${processId}/${filename?.replace(/\.[^/.]+$/, "")}`,
    mode: "folded",
  });

  if (!blobs.length) return null;
  const image = blobs.find((blob) => blob.pathname.split("/")[1] === filename);
  return image;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { filename, processId } = req.query;

  if (
    !filename ||
    !processId ||
    typeof filename !== "string" ||
    typeof processId !== "string"
  ) {
    return res.status(400).json({
      error: "Missing or invalid filename or processId query parameters",
    });
  }

  try {
    const image = await fetchImageUrl(processId, filename);

    if (!image) {
      return res.status(404).json({ error: "File not found" });
    }

    const response = await axios.get(image.url, {
      responseType: "arraybuffer",
    });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "image/jpeg"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", response.data.length);

    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ error: "Failed to serve file" });
  }
}
