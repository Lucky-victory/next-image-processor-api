import { Button } from "@chakra-ui/react";
import axios from "axios";
import { saveAs } from "file-saver";
import { LuDownload } from "react-icons/lu";

const DownloadImage: React.FC<{
  id: string;
  filename: string;
  onSuccess?: () => void;
}> = ({ id, filename, onSuccess = () => {} }) => {
  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `/api/download-file?processId=${id}&filename=${encodeURIComponent(
          filename
        )}`,
        {
          responseType: "blob", // important for downloading binary data
        }
      );
      const blob = new Blob([response.data], { type: "image/jpeg" });
      saveAs(blob, `${filename}`);
      onSuccess();
    } catch (error) {
      console.error("Failed to download file", error);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      colorScheme="blue"
      rounded={"full"}
      size={"sm"}
      leftIcon={<LuDownload />}
    >
      Download
    </Button>
  );
};

export default DownloadImage;
