import { Box, Heading, Text } from "@chakra-ui/react";

export default function PageHeading({
  title = "Freen online",
  boxTitle = "Image Compressor",
}: {
  title: string;
  boxTitle?: string;
}) {
  return (
    <Heading as="h1" size="xl">
      {title}
      {boxTitle && (
        <Box
          position="relative"
          display="inline-block"
          border="2px dotted"
          borderColor="gray.400"
          p={2}
        >
          <Text fontSize="3xl" fontWeight="bold" color={"teal"}>
            {boxTitle}
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
      )}
    </Heading>
  );
}
