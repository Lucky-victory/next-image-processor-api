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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
            <Image
              src={originalImage}
              alt="Original"
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              objectFit="contain"
            />
            <Box
              position="absolute"
              top="0"
              left="0"
              width={`${sliderPosition}%`}
              height="100%"
              overflow="hidden"
            >
              <Image
                src={compressedImage}
                alt="Compressed"
                position="absolute"
                top="0"
                left="0"
                width={`${100 / (sliderPosition / 100)}%`}
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
            >
              <Box
                width="4px"
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
