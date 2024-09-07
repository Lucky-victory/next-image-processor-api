import { NextApiRequest, NextApiResponse } from "next";
import { del, list } from "@vercel/blob";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { id } = req.query; // Folder ID (UUID) from the request
  const { blobs } = await list({
    prefix: `${id}/`,
    mode: "folded",
  });
  if (!blobs.length) {
    return res.status(404).json({ error: "No files found for the given id" });
  }
  console.log(blobs);
  await Promise.all(blobs.map(async (blob) => await del(blob.url)));
  try {
    res
      .status(200)
      .json({ message: `Folder with ID ${id} deleted successfully.` });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: `Failed to delete folder: ${error.message}` });
  }
}
