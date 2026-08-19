import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Media Algorithm Impact Assessment and Awareness System",
  description:
    "A research-backed self-assessment and analytics platform examining how social media algorithms influence student academic performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
