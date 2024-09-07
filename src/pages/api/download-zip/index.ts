import JSZip from "jszip";
import { NextApiRequest, NextApiResponse } from "next";
import { list } from "@vercel/blob";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const zip = new JSZip();
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Missing or invalid id parameter" });
    return;
  }

  try {
    // List all blobs with the given id prefix
    const { blobs } = await list({
      prefix: `${id}/compressed`,
      mode: "folded",
    });
    console.log({ blobs });

    if (blobs.length === 0) {
      res.status(404).json({ error: "No files found for the given id" });
      return;
    }

    // Add each file to the ZIP archive
    await Promise.all(
      blobs.map(async (blob) => {
        const response = await axios.get(blob.url, {
          responseType: "arraybuffer",
        });
        zip.file(blob.pathname.split("/")[1], response.data);
      })
    );

    const content = await zip.generateAsync({ type: "nodebuffer" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename='${id}.zip'`);
    res.status(200).send(content);
  } catch (error: any) {
    console.error("Error creating ZIP file:", error);
    res
      .status(500)
      .json({ error: "Failed to create ZIP file", details: error.message });
  }
}
