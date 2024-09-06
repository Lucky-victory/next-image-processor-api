import React from "react";
import { HStack, Image, Text, Tag, Button } from "@chakra-ui/react";
import { LuArrowBigRight } from "react-icons/lu";
import DownloadImage from "./DownloadImage";

export interface ProcessedImageItemProps {
  image: {
    filename: string;
    format: string;
    newSize: number;
    originalSize: number;
  };
  index: number;
  processId: string;
  handlePreview: (image: {
    filename: string;
    format: string;
    newSize: number;
    originalSize: number;
  }) => void;
}
const ProcessedImageItem: React.FC<ProcessedImageItemProps> = ({
  image,
  index,
  processId,
  handlePreview,
}) => {
  return (
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
        <Tag colorScheme="red" rounded={"full"} size={{ base: "sm", lg: "md" }}>
          <Text as="s">{(image.originalSize / 1024).toFixed(2)} KB</Text>
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
  );
};

export default ProcessedImageItem;
