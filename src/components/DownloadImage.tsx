import { Button } from "@chakra-ui/react";
import axios from "axios";
import { saveAs } from "file-saver";
import { useState } from "react";
import { LuDownload } from "react-icons/lu";
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/image-compressor/download-file`;

const DownloadImage: React.FC<{
  id: string;
  filename: string;
  onSuccess?: () => void;
}> = ({ id, filename, onSuccess = () => {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}?processId=${id}&filename=${encodeURIComponent(filename)}`,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers["Content-Type"]?.toString() || "image/jpeg",
      });
      saveAs(blob, `${filename}`);
      onSuccess();
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to download file", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      colorScheme="blue"
      rounded={"full"}
      size={"sm"}
      leftIcon={<LuDownload />}
      isLoading={isLoading}
      loadingText="Downloading..."
    >
      Download
    </Button>
  );
};

export default DownloadImage;
