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
              maxW={700}
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
                  <Text>or drop some images</Text>
                </VStack>
              )}
            </Stack>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Width</FormLabel>
                  <NumberInput
                    value={width}
                    onChange={(_, value) => setWidth(value)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Height</FormLabel>
                  <NumberInput
                    value={height}
                    onChange={(_, value) => setHeight(value)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Format</FormLabel>
                  <Select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Quality</FormLabel>
                  <NumberInput
                    value={quality}
                    onChange={(_, value) => setQuality(value)}
                    min={1}
                    max={100}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isProcessing}
                >
                  Process Images
                </Button>
              </VStack>
            </form>

            {uploadProgress > 0 && <Progress value={uploadProgress} w="full" />}
            {error && <Text color="red.500">{error}</Text>}
            {images.length > 0 && (
              <SimpleGrid columns={[2, 3, 4, 5]} spacing={4} w="full">
                {images.map((image, index) => (
                  <Box key={index} position="relative" paddingBottom="100%">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Thumbnail ${index + 1}`}
                      objectFit="cover"
                      position="absolute"
                      top={0}
                      left={0}
                      w="full"
                      h="full"
                      borderRadius="md"
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Container>
      </Box>
    </PageWrapper>
  );
}
