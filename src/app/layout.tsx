import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";






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
