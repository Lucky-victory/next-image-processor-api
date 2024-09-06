import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Box,
  Flex,
  Tag,
} from "@chakra-ui/react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string;
  compressedImage: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  originalImage,
  compressedImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(x, 0), 100));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(x, 0), 100));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSliderPosition((sliderPosition / 100) * rect.width);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sliderPosition]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Image Comparison</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            ref={containerRef}
            position="relative"
            width="100%"
            height="70vh"
            overflow="hidden"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              width={`100%`}
              height="100%"
              overflow="hidden"
            >
              <Tag rounded={"full"} colorScheme="gray" fontWeight={600}>
                Before
              </Tag>
              <Image
                src={originalImage}
                alt="Original"
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                objectFit="contain"
                pointerEvents={"none"}
              />
            </Box>
            <Box
              position="absolute"
              top="0"
              left="0"
              width={`100%`}
              height="100%"
              overflow="hidden"
              clipPath={`inset(0 0 0 ${sliderPosition}%)`}
              transition="clip-path 0.1s ease-out"
              zIndex={500}
              bg={"white"}
            >
              <Tag
                pos={"absolute"}
                right={0}
                rounded={"full"}
                colorScheme="green"
                fontWeight={600}
              >
                After
              </Tag>
              <Image
                src={compressedImage}
                alt="Compressed"
                pointerEvents={"none"}
                position="absolute"
                top="0"
                left="0"
                width={`100%`}
                height="100%"
                objectFit="contain"
              />
            </Box>
            <Flex
              position="absolute"
              top="0"
              left={`${sliderPosition}%`}
              height="100%"
              transform="translateX(-50%)"
              alignItems="center"
              justifyContent="center"
              cursor="ew-resize"
              zIndex={501}
            >
              <Box
                width="3px"
                height="100%"
                bg="white"
                boxShadow="0 0 5px rgba(0, 0, 0, 0.5)"
              />
              <Box
                width="20px"
                height="20px"
                borderRadius="50%"
                bg="white"
                boxShadow="0 0 5px rgba(0, 0, 0, 0.5)"
                position="absolute"
              />
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImagePreviewModal;
