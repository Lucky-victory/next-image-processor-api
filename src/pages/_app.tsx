import type { AppProps } from "next/app";
import { fonts } from "@/font";
import "@/styles/globals.css";
import "swiper/css";
import {
  ChakraProvider,
  withDefaultColorScheme,
  theme as chakraTheme,
  extendTheme,
} from "@chakra-ui/react";

const theme = extendTheme(
  {
    ...chakraTheme,
    fonts: {
      heading: "var(--font-lato)",
      body: "var(--font-lato)",
    },

    styles: {
      global: {
        body: {
          bg: "gray.100",
        },
      },
    },
  },
  withDefaultColorScheme({
    colorScheme: "blue",
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-lato: ${fonts.lato.style.fontFamily};
          }
        `}
      </style>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}
