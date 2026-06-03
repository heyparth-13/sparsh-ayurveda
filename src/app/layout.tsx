import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sparsh Veda | Nurtured By Nature",
  description: "Experience handcrafted Ayurvedic luxury. 100% natural, chemical-free hair oil, cleansers, face wash, and handcrafted soap bars inspired by traditional Ayurveda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
