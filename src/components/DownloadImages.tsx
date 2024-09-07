import { useDeleteFolder } from "@/hooks";
import { Button } from "@chakra-ui/react";
import axios from "axios";
import { saveAs } from "file-saver";
import { useState } from "react";
import { LuDownload } from "react-icons/lu";

const DownloadImages: React.FC<{ id: string; onSuccess?: () => void }> = ({
  id,
  onSuccess = () => {},
}) => {
  const { deleteFolder } = useDeleteFolder();
  const [isLoading, setIsLoading] = useState(false);
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/download-zip?id=${id}`, {
        responseType: "blob", // important for downloading binary data
      });
      const blob = new Blob([response.data], { type: "application/zip" });
      saveAs(blob, `${id}.zip`);
      //   await deleteFolder(id);
      onSuccess();
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to download ZIP file", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      colorScheme="blue"
      alignSelf={"flex-end"}
      rounded={"full"}
      width={{ base: "100%", md: "200px" }}
      leftIcon={<LuDownload />}
      isLoading={isLoading}
      loadingText="Downloading..."
    >
      Download All (.zip)
    </Button>
  );
};

export default DownloadImages;
