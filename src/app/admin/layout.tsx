"use client";

import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f8fafc" }}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}