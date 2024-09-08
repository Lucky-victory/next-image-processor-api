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
  Select,
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
  const [videos, setVideos] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(23);
  const [format, setFormat] = useState<string>("mp4");
  const [processedVideos, setProcessedVideos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setVideos((prevVideos) => [...prevVideos, ...acceptedFiles]);
    acceptedFiles.forEach((file) => {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (videos.length === 0) {
      setError("Please select at least one video");
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    videos.forEach((video) => {
      formData.append(`video`, video);
    });

    try {
      const response = await axios.post(
        `/api/video-compressor?q=${quality}&f=${format}`,
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
                [videos[progressEvent.loaded % videos.length].name]: progress,
              }));
            }
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to process videos");
      }

      const result = await response.data;
      setProcessedVideos(result.videos);
      setError(null);
    } catch (err) {
      setError("Error processing videos");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (video: any) => {
    const link = document.createElement("a");
    link.href = `/processed/${video.filename}`;
    link.download = video.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    processedVideos.forEach((video) => {
      handleDownload(video);
    });
  };

  const handlePreview = (video: any) => {
    setPreviewVideo(`/processed/${video.filename}`);
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
                  Video Compressor
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
              Compress videos with one click, reduce video size{" "}
              <Text as={"strong"}>without losing video quality</Text>
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
                      Upload Video
                    </Button>
                  </motion.div>
                  <Text>or drop some videos</Text>
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
                    <FormLabel>Quality (CRF)</FormLabel>
                    <Slider
                      value={quality}
                      onChange={(value) => setQuality(value)}
                      min={0}
                      max={51}
                      width="100%"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text textAlign="center">{quality}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Format</FormLabel>
                    <Select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      <option value="mp4">MP4</option>
                      <option value="webm">WebM</option>
                      <option value="avi">AVI</option>
                    </Select>
                  </FormControl>
                </Stack>
                <Button
                  alignSelf={"center"}
                  type="submit"
                  colorScheme="blue"
                  rounded={"full"}
                  isLoading={isProcessing}
                  width={{ base: "100%", md: "200px" }}
                  isDisabled={videos.length === 0}
                >
                  Compress
                </Button>
              </VStack>
            </form>
            {processedVideos.length > 0 && (
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
                <Button
                  onClick={handleDownloadAll}
                  colorScheme="blue"
                  alignSelf={"flex-end"}
                  rounded={"full"}
                  width={{ base: "100%", md: "200px" }}
                  leftIcon={<LuDownload />}
                >
                  Download All
                </Button>
                {processedVideos.map((video, index) => (
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
                      <Text as={"span"}>{video.filename}</Text>
                    </HStack>
                    <HStack gap={1}>
                      <Tag
                        colorScheme="gray"
                        rounded={"full"}
                        size={{ base: "sm", lg: "md" }}
                      >
                        <Text as="s">
                          {(video.originalSize / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </Tag>{" "}
                      <LuArrowBigRight size={14} />{" "}
                      <Tag
                        colorScheme="green"
                        rounded={"full"}
                        size={{ base: "sm", lg: "md" }}
                      >
                        {(video.newSize / 1024 / 1024).toFixed(2)} MB
                      </Tag>
                    </HStack>
                    <HStack>
                      <Button
                        onClick={() => handleDownload(video)}
                        size="sm"
                        colorScheme="blue"
                        rounded={"full"}
                      >
                        Download
                      </Button>
                      <Button
                        onClick={() => handlePreview(video)}
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

            {videos.length > 0 && !processedVideos.length && (
              <VStack
                spacing={4}
                w="full"
                bg={"white"}
                px={3}
                py={4}
                rounded={"xl"}
                maxW={800}
              >
                {videos.map((video, index) => (
                  <HStack
                    key={index}
                    w="full"
                    spacing={4}
                    p={2}
                    bg="gray.100"
                    borderRadius="lg"
                  >
                    <Text flex={1} isTruncated>
                      {video.name}
                    </Text>
                    <CircularProgress
                      value={uploadProgress[video.name] || 0}
                      size="40px"
                      color="blue.500"
                    >
                      <CircularProgressLabel>
                        {uploadProgress[video.name] > 0 &&
                          uploadProgress[video.name] + "%"}
                      </CircularProgressLabel>
                    </CircularProgress>
                    <Text>{(video.size / 1024 / 1024).toFixed(2)} MB</Text>
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
          <ModalHeader>Video Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewVideo && (
              <video controls width="100%">
                <source src={previewVideo} type={`video/${format}`} />
                Your browser does not support the video tag.
              </video>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageWrapper>
  );
}
