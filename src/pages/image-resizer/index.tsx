import PageWrapper from "@/components/PageWrapper";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function ComingSoon() {
  return (
    <PageWrapper>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bg="gray.100"
      >
        <VStack spacing={6} textAlign="center">
          <Heading as="h1" size="2xl" color="blue.500">
            Coming Soon
          </Heading>
          <Text fontSize="xl" color="gray.600">
            We&apos;re working hard to bring you something amazing. Stay tuned!
          </Text>
        </VStack>
      </Box>
    </PageWrapper>
  );
}
