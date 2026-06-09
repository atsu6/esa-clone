import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "esa clone - Team Documentation",
  description: "A self-hosted esa.io clone for team knowledge management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
