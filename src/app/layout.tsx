import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Judah Sullivan - Software Engineer & Frontend Architect",
    template: "%s | Judah Sullivan"
  },
  description: "Software Engineer, Frontend Architect, and Digital Craftsman based in Houston, TX. Specializing in creative systems and scalable code.",
  keywords: ["software engineer", "frontend architect", "web developer", "Houston", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Judah Sullivan" }],
  creator: "Judah Sullivan",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Judah Sullivan",
    title: "Judah Sullivan - Software Engineer & Frontend Architect",
    description: "Software Engineer, Frontend Architect, and Digital Craftsman based in Houston, TX.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};






export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
