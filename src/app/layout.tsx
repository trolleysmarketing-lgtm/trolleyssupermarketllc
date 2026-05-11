import type { Metadata } from "next";

export const metadata: Metadata = {
  // metadataBase dışındaki temel meta bilgileri burada olabilir
  // ama asıl SEO locale layout'ta generateMetadata ile yapılıyor
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // children'dan locale'i almak için bir yol yok,
  // bu yüzden dir attribute'unu client-side ayarlayabiliriz
  return (
    <html lang="en">
      <head>
        {/* Bu meta'lar tüm dillerde aynı olacaksa burada kalabilir */}
        <meta name="theme-color" content="#0e76bc" />
        <meta name="msapplication-TileColor" content="#0e76bc" />
      </head>
      <body className="flex flex-col min-h-screen" style={{ margin: 0, fontFamily: "sans-serif", background: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}