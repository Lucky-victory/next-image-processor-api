import { useState } from "react";
import axios from "axios";

export const useDeleteFolder = () => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const deleteFolder = async (folderId: string) => {
    if (!folderId) {
      setMessage("Please provide a valid folder ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`/api/drop-folder/${folderId}`);
      setMessage(response.data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data?.error || "Failed to delete folder.");
      } else {
        setMessage("Failed to delete folder.");
      }
    } finally {
      setLoading(false);
    }
  };
  return { deleteFolder, message, loading };
};
