import type { Metadata } from "next";
import Script from "next/script";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import AppProviders from "@/components/providers/AppProviders";
import { getRuntimeConfig } from "@/lib/runtime-config.server";
import { Toaster } from "sonner";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "curlgeco",
  description: "AI playground for model testing, prompt evaluation, and streaming chat.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getRuntimeConfig();

  // Font variables belong on <html>: --font-sans is declared on :root, so a
  // variable defined further down the tree resolves to invalid there.
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="bg-background text-foreground antialiased">
        {config.gtmId ? (
          <>
            <Script id="gtm-loader" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${config.gtmId}');
              `}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${config.gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        <AppProviders config={config}>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}
