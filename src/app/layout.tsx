import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";

export default async function RootLayout({
  children,
  lang,
}: {
  children: ReactNode;
  lang: string | "en";
}) {
  return (
    <html
      lang={lang}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
