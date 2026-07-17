import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow | Olağanüstü Todo Uygulaması",
  description:
    "Görevlerini yönet, başarımlar kazan, seviye atla. Oyunlaştırılmış, motive edici todo uygulaması.",
  keywords: ["todo", "görev yönetimi", "üretkenlik", "gamification", "taskflow"],
  authors: [{ name: "TaskFlow" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#040812",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-deep-bg text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
