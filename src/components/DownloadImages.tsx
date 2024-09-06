import { Button } from "@chakra-ui/react";
import axios from "axios";
import { saveAs } from "file-saver";
import { LuDownload } from "react-icons/lu";

const DownloadImages: React.FC<{ id: string }> = ({ id }) => {
  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/download-zip?id=${id}`, {
        responseType: "blob", // important for downloading binary data
      });
      const blob = new Blob([response.data], { type: "application/zip" });
      saveAs(blob, `${id}.zip`);
    } catch (error) {
      console.error("Failed to download ZIP file", error);
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
    >
      Download All (.zip)
    </Button>
  );
};

export default DownloadImages;
