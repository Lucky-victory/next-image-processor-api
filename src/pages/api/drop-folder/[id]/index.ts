import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { id } = req.query; // Folder ID (UUID) from the request

  // Define the path to the folder (adjust as needed)
  const folderPath = path.join(
    process.cwd(),
    "public",
    "processed",
    id as string
  );

  try {
    // Check if the folder exists
    const folderExists = await fs
      .stat(folderPath)
      .then(() => true)
      .catch(() => false);

    if (!folderExists) {
      return res.status(404).json({ error: `Folder with ID ${id} not found.` });
    }

    // Delete the folder and all its contents (recursive: true is needed for non-empty folders)
    await fs.rm(folderPath, { recursive: true, force: true });

    res
      .status(200)
      .json({ message: `Folder with ID ${id} deleted successfully.` });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: `Failed to delete folder: ${error.message}` });
  }
}
