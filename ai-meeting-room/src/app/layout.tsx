import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI開発会議室 | Claude x Gemini",
  description:
    "Claude と Gemini が設計を議論し、承認後にフルオート実装するAI開発会議室",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-gradient-mesh min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
