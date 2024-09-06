import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Progress,
  Select,
  SimpleGrid,
  Text,
  VStack,
  Image,
  Stack,
} from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";

const BackgroundBlob = ({
  top,
  left,
  size,
  color,
}: {
  top: string;
  left: string;
  size: string;
  color: string;
}) => (
  <Box
    position="absolute"
    top={top}
    left={left}
    width={size}
    height={size}
    borderRadius="full"
    bg={color}
    filter="blur(70px)"
    opacity={0.6}
    zIndex={-1}
  />
);

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [format, setFormat] = useState<string>("jpeg");
  const [quality, setQuality] = useState<number>(80);
  const [processedImages, setProcessedImages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prevImages) => [...prevImages, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image`, image);
    });
    formData.append("width", width.toString());
    formData.append("height", height.toString());
    formData.append("format", format);
    formData.append("quality", quality.toString());

    try {
      const response = await fetch("/api/image-processor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process images");
      }

      const result = await response.json();
      setProcessedImages(result.images);
      setError(null);
    } catch (err) {
      setError("Error processing images");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setUploadProgress(100);
    }
  };

  return (
    <PageWrapper>
      <Box position="relative" minHeight="100vh" overflow="hidden">
        <BackgroundBlob top="10%" left="5%" size="300px" color="blue.300" />
        <BackgroundBlob top="60%" left="80%" size="250px" color="purple.300" />
        <BackgroundBlob top="30%" left="50%" size="200px" color="green.300" />
        <BackgroundBlob top="80%" left="20%" size="350px" color="pink.300" />
        <Container
          maxW="container.xl"
          py={8}
          position="relative"
          zIndex={1}
        ></Container>
      </Box>
    </PageWrapper>
  );
}
