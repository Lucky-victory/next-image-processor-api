import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { files } from "jszip";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename, processId } = req.query;
  console.log({ filename, processId });
  const filePath = path.join(
    process.cwd(),
    "public",
    "processed",
    processId as string,
    filename as string
  ); // Path to the file
  console.log({ filePath, filename, processId });

  const fileStat = fs.statSync(filePath);

  res.setHeader("Content-Type", "image/jpeg"); // Adjust based on file type
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", fileStat.size);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
