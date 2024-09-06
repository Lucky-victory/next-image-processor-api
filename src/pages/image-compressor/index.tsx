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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress,
  SimpleGrid,
  Text,
  VStack,
  Image,
  Stack,
  HStack,
  IconButton,
  CircularProgress,
  CircularProgressLabel,
  Tag,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import {
  LuArrowBigRight,
  LuArrowRight,
  LuDownload,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";
import axios from "axios";
import DownloadImages from "@/components/DownloadImages";
import DownloadImage from "@/components/DownloadImage";

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
  const [processId, setProcessId] = useState("");
  const [quality, setQuality] = useState<number>(70);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [processedImages, setProcessedImages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prevImages) => [...prevImages, ...acceptedFiles]);
    acceptedFiles.forEach((file) => {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
        `/api/image-processor?q=${quality}&w=${width}&h=${height}`,
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

  const handleDownload = (image: any) => {
    const link = document.createElement("a");
    link.href = `/processed/${image.filename}`;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[images[index].name];
      return newProgress;
    });
  };
  const handlePreview = (image: any) => {
    setPreviewImage(`/processed/${processId}/${image.filename}`);
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
            <Heading as="h1" size="xl">
              Free online
              <Box
                position="relative"
                display="inline-block"
                border="2px dotted"
                borderColor="gray.400"
                p={2}
              >
                <Text fontSize="3xl" fontWeight="bold" color={"teal"}>
                  Image Compressor
                </Text>
                <Box
                  position="absolute"
                  top="-4px"
                  left="-4px"
                  w="8px"
                  h="8px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.400"
                />
                <Box
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  w="8px"
                  h="8px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.400"
                />
                <Box
                  position="absolute"
                  bottom="-4px"
                  left="-4px"
                  w="8px"
                  h="8px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.400"
                />
                <Box
                  position="absolute"
                  bottom="-4px"
                  right="-4px"
                  w="8px"
                  h="8px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.400"
                />
              </Box>
            </Heading>
            <Text>
              Compress images with one click, reduce image size{" "}
              <Text as={"strong"}>without losing image quality</Text>
            </Text>
            <Stack
              {...getRootProps()}
              w="full"
              p={6}
              maxW={800}
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
                    (max 50MB)
                  </Text>
                </VStack>
              )}
            </Stack>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack
                spacing={4}
                align="stretch"
                bg={"white"}
                rounded={"xl"}
                p={4}
                maxW={800}
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
                  width={{ base: "100%", md: "200px" }}
                  isDisabled={images.length === 0}
                >
                  Compress
                </Button>
              </VStack>
            </form>
            {processedImages.length > 0 && (
              <VStack
                spacing={4}
                align="stretch"
                mt={8}
                bg={"white"}
                rounded={"xl"}
                p={4}
                maxW={800}
                w={{ base: "full" }}
                mx={"auto"}
              >
                <DownloadImages
                  id={processId}
                  onSuccess={() => {
                    setProcessedImages([]);
                  }}
                />
                {processedImages.map((image, index) => (
                  <HStack
                    w={"full"}
                    key={index}
                    justify="space-between"
                    align="center"
                    p={2}
                    bg="gray.100"
                    borderRadius="lg"
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                  >
                    <HStack>
                      <Image
                        src={`/processed/${processId}/${image.filename}`}
                        alt={`Thumbnail ${index + 1}`}
                        objectFit="cover"
                        boxSize="50px"
                        borderRadius="md"
                      />
                      <Text as={"span"}>{image.filename}</Text>
                    </HStack>
                    <HStack gap={1}>
                      <Tag
                        colorScheme="red"
                        rounded={"full"}
                        size={{ base: "sm", lg: "md" }}
                      >
                        <Text as="s">
                          {(image.originalSize / 1024).toFixed(2)} KB
                        </Text>
                      </Tag>{" "}
                      <LuArrowBigRight size={14} />{" "}
                      <Tag
                        colorScheme="green"
                        rounded={"full"}
                        size={{ base: "sm", lg: "md" }}
                      >
                        {(image.newSize / 1024).toFixed(2)} KB
                      </Tag>
                    </HStack>
                    <HStack>
                      <DownloadImage id={processId} filename={image.filename} />
                      <Button
                        onClick={() => handlePreview(image)}
                        size="sm"
                        colorScheme="teal"
                        rounded={"full"}
                      >
                        Preview
                      </Button>
                    </HStack>
                  </HStack>
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
                maxW={800}
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
                      src={URL.createObjectURL(image)}
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
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Image Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewImage && (
              <Image
                src={previewImage}
                alt="Preview"
                maxW="100%"
                maxH="70vh"
                mx="auto"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageWrapper>
  );
}
