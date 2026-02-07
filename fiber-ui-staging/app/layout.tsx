import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import {
  ThemeProvider,
  PostHogClientProvider,
  SentryClientProvider,
  AlgoliaInsightsProvider,
  SolanaWalletProvider,
  WalletBrowserDetector,
} from "@/lib/providers";
import { Toaster } from "@/lib/ui/feedback/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { IntercomProvider } from "@/lib/analytics/feature";
import "./globals.css";
import { LayoutWrapper } from "@/lib/layout/feature/layout-wrapper";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fiber",
  description: "Solana Commerce Infrastructure: Powering the future of on-chain commerce",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <SentryClientProvider>
          <PostHogClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
              enableColorScheme={false}
            >
              <AuthProvider>
                <SolanaWalletProvider>
                  <WalletBrowserDetector />
                  <AlgoliaInsightsProvider />
                  <IntercomProvider />
                  <LayoutWrapper>{children}</LayoutWrapper>
                </SolanaWalletProvider>
              </AuthProvider>
            </ThemeProvider>
          </PostHogClientProvider>
        </SentryClientProvider>
        <Toaster
          toastOptions={{
            style: {
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              border: "1px solid hsl(var(--border))",
              opacity: 1,
            },
            classNames: {
              toast: "!opacity-100",
            },
          }}
        />
      </body>
    </html>
  );
}
