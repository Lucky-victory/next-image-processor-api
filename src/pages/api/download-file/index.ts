import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename, processId } = req.query;
  if (!filename || !processId) {
    return res
      .status(400)
      .json({ error: "Missing filename or processId query parameters" });
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    "processed",
    processId as string,
    filename as string
  );

  const fileStat = fs.statSync(filePath);

  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", fileStat.size);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
