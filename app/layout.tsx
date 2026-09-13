import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karachi Pulse — Live Area Risk Map",
  description:
    "Karachi Pulse turns citizen reports and weather signals into a live area-risk map, helping communities understand emerging problems before they escalate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router layout has no pages/_document equivalent — this is the standard way to load fonts here. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
