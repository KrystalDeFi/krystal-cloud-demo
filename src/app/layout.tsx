import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import NavBar from "./NavBar";
import ThemeProvider from "./ThemeProvider";
import EmbedButton from "../components/EmbedButton";
import ApiKeyHandler from "../components/ApiKeyHandler";
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
            <ApiKeyHandler />
            <NavBar />
            {children}
            <EmbedButton />
          </ChainsProtocolsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
