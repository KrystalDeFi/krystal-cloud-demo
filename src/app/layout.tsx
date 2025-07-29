import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import ThemeProvider from "./ThemeProvider";
import { ChainsProtocolsProvider } from "../contexts/ChainsProtocolsContext";
import { EmbedConfigProvider } from "../contexts/EmbedConfigContext";
import { EmbedWrapper } from "../components/EmbedWrapper";
import EmbedButton from "../components/EmbedButton";
import NavBar from "./NavBar";

export const metadata: Metadata = {
  title: "Krystal Cloud: Embeddable UI",
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
        <EmbedConfigProvider>
          <ThemeProvider>
            <ChainsProtocolsProvider>
              <EmbedWrapper type="navigation">
                <NavBar />
              </EmbedWrapper>
              {children}
              <EmbedButton />
            </ChainsProtocolsProvider>
          </ThemeProvider>
        </EmbedConfigProvider>
      </body>
    </html>
  );
}
