import { Box, Container } from "@chakra-ui/react";
import Navbar from "./Navbar";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container maxW="container.2xl" px={0}>
      <Navbar />
      <Box as="main" pt="var(--navbar-height)">
        {children}
      </Box>
    </Container>
  );
}
