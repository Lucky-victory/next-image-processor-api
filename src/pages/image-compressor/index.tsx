import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  Image,
  Stack,
  HStack,
  IconButton,
  CircularProgress,
  CircularProgressLabel,
  InputGroup,
  InputRightAddon,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { LuTrash, LuUpload, LuX } from "react-icons/lu";
import { motion } from "framer-motion";
import PageWrapper from "@/components/PageWrapper";
import axios from "axios";
import DownloadImages from "@/components/DownloadImages";
import ProcessedImageItem from "@/components/ProcessedImageItem";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import BackgroundBlob from "@/components/BackgroundBlob";
import PageHeading from "@/components/PageHeading";
import { useDeleteFolder } from "@/hooks";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/image-compressor`;
export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [processId, setProcessId] = useState("");
  const [quality, setQuality] = useState<number>(50);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [processedImages, setProcessedImages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const uploadedImagesRef = useRef<{ [key: string]: string }>({});

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      const imageFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      setImages((prevImages) => [...prevImages, ...imageFiles]);
      imageFiles.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        uploadedImagesRef.current[file.name] = URL.createObjectURL(file);
      });

      if (rejectedFiles.length > 0) {
        toast({
          title: "Unsupported file(s)",
          description: "Only image files are allowed.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image`, image);
    });

    try {
      const response = await axios.post(
        `${API_URL}?q=${quality}&w=${width}&h=${height}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => ({
                ...prev,
                [images[progressEvent.loaded % images.length].name]: progress,
              }));
            }
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to process images");
      }

      const result = await response.data;
      setProcessedImages(result.images);
      setProcessId(result.id);
      setImages([]);
      setError(null);
    } catch (err) {
      setError("Error processing images");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  function reset() {
    setImages([]);
    setQuality(50);
    setWidth("");
    setHeight("");
    setProcessedImages([]);
    setError(null);
    setIsProcessing(false);
    setUploadProgress({});
    setPreviewImage(null);
    setProcessId("");
  }
  const handleRemoveImage = (index: number) => {
    const removedImage = images[index];
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[removedImage.name];
      return newProgress;
    });
    URL.revokeObjectURL(uploadedImagesRef.current[removedImage.name]);
    delete uploadedImagesRef.current[removedImage.name];
  };

  const handlePreview = (image: any) => {
    const originalImage = uploadedImagesRef.current[image.originalFilename];
    if (originalImage) {
      setPreviewImage(originalImage);
    } else {
      setPreviewImage(`${image.url}`);
    }
    onOpen();
  };

  return (
    <PageWrapper>
      <Box position="relative" minHeight="100vh" overflow="hidden">
        <BackgroundBlob top="10%" left="5%" size="300px" color="blue.300" />
        <BackgroundBlob top="60%" left="80%" size="250px" color="purple.300" />
        <BackgroundBlob top="30%" left="50%" size="200px" color="green.300" />
        <BackgroundBlob top="80%" left="20%" size="350px" color="pink.300" />
        <Container maxW="container.xl" py={8} position="relative" zIndex={1}>
          <VStack spacing={8}>
            <PageHeading title="Free online" />
            <Text>
              Compress images with one click, reduce image size{" "}
              <Text as={"strong"}>without losing image quality</Text>
            </Text>
            <Stack
              {...getRootProps()}
              w="full"
              p={6}
              maxW={900}
              h={{ base: 150, md: 200 }}
              border="2px dashed"
              borderColor={isDragActive ? "blue.500" : "gray.300"}
              borderRadius="xl"
              textAlign="center"
              cursor="pointer"
              align={"center"}
              shadow={"lg"}
              justify={"center"}
              bg="rgba(255, 255, 255, 0.8)"
              backdropFilter="blur(10px)"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Text>Drop the files here ...</Text>
              ) : (
                <VStack>
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.3, ease: "easeInOut" },
                    }}
                  >
                    <Button
                      leftIcon={<LuUpload />}
                      rounded={"full"}
                      size={"lg"}
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      _hover={{
                        bgGradient: "linear(to-r, blue.500, purple.600)",
                      }}
                    >
                      Upload Image
                    </Button>
                  </motion.div>
                  <Text as={"span"} color={"gray.600"}>
                    or drop some images
                  </Text>
                  <Text
                    as={"span"}
                    fontSize={"small"}
                    color={"gray.600"}
                    fontWeight={500}
                  >
                    (max 4MB)
                  </Text>
                </VStack>
              )}
            </Stack>
            {error && (
              <Text color="red.500" textAlign="center" fontWeight="bold">
                {error}
              </Text>
            )}

            {!processedImages.length && (
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <VStack
                  spacing={4}
                  align="stretch"
                  bg={"white"}
                  rounded={"xl"}
                  p={4}
                  maxW={900}
                  mx={"auto"}
                >
                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    <FormControl>
                      <FormLabel>Width</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="Width"
                        />
                        <InputRightAddon>px</InputRightAddon>
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Height</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Height"
                        />
                        <InputRightAddon>px</InputRightAddon>
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Quality</FormLabel>
                      <Slider
                        value={quality}
                        onChange={(value) => setQuality(value)}
                        min={1}
                        max={100}
                        width="100%"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                      <Text textAlign="center">{quality}%</Text>
                    </FormControl>
                  </Stack>
                  <Button
                    alignSelf={"center"}
                    type="submit"
                    colorScheme="blue"
                    rounded={"full"}
                    isLoading={isProcessing}
                    loadingText="Processing..."
                    width={{ base: "100%", md: "250px" }}
                    isDisabled={images.length === 0}
                  >
                    Compress
                  </Button>
                </VStack>
              </form>
            )}

            {processedImages.length > 0 && (
              <VStack
                spacing={4}
                align="stretch"
                mt={8}
                bg={"white"}
                rounded={"xl"}
                p={4}
                maxW={900}
                w={{ base: "full" }}
                mx={"auto"}
              >
                <HStack
                  flexDir={{ base: "column", md: "row" }}
                  alignSelf={"flex-end"}
                >
                  <Button
                    rounded={"full"}
                    colorScheme="red"
                    width={{ base: "100%", md: "150px" }}
                    leftIcon={<LuTrash />}
                    onClick={() => {
                      reset();
                    }}
                  >
                    Reset{" "}
                  </Button>
                  <DownloadImages
                    id={processId}
                    onSuccess={() => {
                      setProcessedImages([]);
                      setImages([]);
                      uploadedImagesRef.current = {};
                    }}
                  />
                </HStack>
                {processedImages.map((image, index) => (
                  <ProcessedImageItem
                    key={index}
                    image={image}
                    index={index}
                    processId={processId}
                    handlePreview={handlePreview}
                  />
                ))}
              </VStack>
            )}

            {images.length > 0 && !processedImages.length && (
              <VStack
                spacing={4}
                w="full"
                bg={"white"}
                px={3}
                py={4}
                rounded={"xl"}
                maxW={900}
              >
                {images.map((image, index) => (
                  <HStack
                    key={index}
                    w="full"
                    spacing={4}
                    p={2}
                    bg="gray.100"
                    borderRadius="lg"
                  >
                    <Image
                      src={uploadedImagesRef.current[image.name]}
                      alt={`Thumbnail ${index + 1}`}
                      objectFit="cover"
                      boxSize="50px"
                      borderRadius="md"
                    />
                    <Text flex={1} isTruncated>
                      {image.name}
                    </Text>
                    <CircularProgress
                      value={uploadProgress[image.name] || 0}
                      size="40px"
                      color="blue.500"
                    >
                      <CircularProgressLabel>
                        {uploadProgress[image.name] + "%"}
                      </CircularProgressLabel>
                    </CircularProgress>
                    <Text>{(image.size / 1024).toFixed(2)} KB</Text>
                    <IconButton
                      aria-label="remove image"
                      colorScheme="red"
                      size={"xs"}
                      rounded={"full"}
                      isDisabled={isProcessing}
                      onClick={() => {
                        handleRemoveImage(index);
                      }}
                    >
                      <LuX />
                    </IconButton>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
      <ImagePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        compressedImage={`${
          processedImages.find(
            (img) =>
              uploadedImagesRef.current[img.originalFilename] === previewImage
          )?.url
        }`}
        originalImage={previewImage!}
      />
    </PageWrapper>
  );
}
