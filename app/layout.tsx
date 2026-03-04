import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

function getMetadataBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return new URL("http://localhost:3000");

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol);
  } catch {
    return new URL("http://localhost:3000");
  }
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "iBerryCart - Premium Natural Marketplace",
    template: "%s | iBerryCart",
  },
  description:
    "Shop premium tea, coffee, honey, spices and wellness essentials from iBerryCart.",
  metadataBase: getMetadataBaseUrl(),
};

const noopMono = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${noopMono.variable} bg-[#F3E8FF] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
