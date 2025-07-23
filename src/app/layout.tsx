import React from "react";
import type { Metadata } from "next";
import { ChakraProvider } from "@chakra-ui/react";
import NavBar from "./NavBar";
import ThemeProvider from "./ThemeProvider";
import EmbedButton from "../components/EmbedButton";
import { ChainsProtocolsProvider } from "../contexts/ChainsProtocolsContext";

export const metadata: Metadata = {
  title: "Krystal Cloud Demo",
  description: "Demo application for cloud.krystal.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ChainsProtocolsProvider>
            <NavBar />
            {children}
            <EmbedButton />
          </ChainsProtocolsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
