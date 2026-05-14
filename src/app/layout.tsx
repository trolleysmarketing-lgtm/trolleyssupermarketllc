import type { Metadata } from "next";

export const metadata: Metadata = {};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0e76bc" />
        <meta name="msapplication-TileColor" content="#0e76bc" />
      </head>
      <body
        className="flex flex-col min-h-screen"
        style={{ margin: 0, fontFamily: "sans-serif", background: "#f8fafc" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}