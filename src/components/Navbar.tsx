import React from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
const Navbar: React.FC = () => {
  const router = useRouter();

  const links = [
    { path: "/image-compressor", label: "Image Compressor" },
    { path: "/image-resizer", label: "Image Resizer" },
    { path: "/background-remover", label: "Background Remover" },
    { path: "/video-compressor", label: "Video Compressor" },
  ];

  const bgColor = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("blue.500", "gray.100");

  return (
    <Box
      as="nav"
      bg={bgColor}
      color={color}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex align="center" justify="space-between" wrap="wrap" px={4} py={3}>
        <Flex align="center" mr={5}>
          <Heading as="h1" size="lg" letterSpacing={"tighter"}>
            Image Tools
          </Heading>
        </Flex>

        <Box>
          {links.map((link) => {
            const isActive = router.pathname === link.path;
            return (
              <Button
                key={link.path}
                href={link.path}
                as={Link}
                variant={"ghost"}
                mr={2}
                fontWeight={isActive ? "bold" : "normal"}
                borderBottom={isActive ? "2px solid" : "none"}
                borderRadius={isActive ? "0" : "md"}
                _hover={{
                  borderBottom: "2px solid",
                  borderRadius: "0",
                  color: "blue.500",
                }}
                textDecor={"none!important"}
                color={isActive ? "blue.500" : "gray.700"}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
