import { Box } from "@chakra-ui/react";

export default function BackgroundBlob({
  top,
  left,
  size,
  color,
}: {
  top: string;
  left: string;
  size: string;
  color: string;
}) {
  return (
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
}
