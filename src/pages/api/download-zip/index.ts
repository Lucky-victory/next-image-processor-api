import JSZip from "jszip";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Helper function to read files from a folder
const getFilesInFolder = (folderPath: string) => {
  const fullPath = path.join(process.cwd(), folderPath);
  return fs.readdirSync(fullPath).map((fileName) => ({
    name: fileName,
    path: path.join(fullPath, fileName),
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const zip = new JSZip();
  const { id } = req.query;
  const folderPath = path.join("public", "processed", id as string);
  try {
    const files = getFilesInFolder(folderPath);

    // Add each file to the ZIP archive
    files.forEach((file) => {
      const fileContent = fs.readFileSync(file.path);
      zip.file(file.name, fileContent); // Add the file as binary data
    });

    // Generate the ZIP file and send it as a response
    zip.generateAsync({ type: "nodebuffer" }).then((content) => {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename='${id}.zip'`);
      res.status(200).send(content);
      res.end();
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to create ZIP file", details: error.message });
  }
}
