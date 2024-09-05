import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "900", "700"],
  variable: "--font-lato",
});
export const fonts = {
  lato: lato,
};
