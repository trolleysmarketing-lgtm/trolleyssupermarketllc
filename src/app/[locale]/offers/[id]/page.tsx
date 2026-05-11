import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
const blogImages: Record<string, string> = {
  "smart-grocery-shopping-uae-save-money-2026": "/blog/smart-grocery-shopping-uae.webp",
  "healthy-eating-dubai-affordable-supermarket-foods": "/blog/healthy-eating-dubai-supermarket.webp",
  "how-to-choose-fresh-meat-fruits-vegetables-uae": "/blog/fresh-food-uae-supermarket-guide.webp",
  "best-weekly-supermarket-deals-uae-trolleys": "/blog/uae-supermarket-weekly-offers.webp",
  "daily-life-uae-supermarkets-shopping-guide": "/blog/supermarket-lifestyle-uae-dubai.webp",
  "top-imported-foods-uae-supermarkets-trolleys": "/blog/imported-foods-uae-supermarket.webp",
};
export default async function CatalogRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  try {
    const dataPath = path.join(process.cwd(), "data", "offers.json");
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    const catalog = data.catalogs?.find((c: any) => c.id === id);
    if (!catalog) notFound();

    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0;url=/uploads/catalogs/${catalog.fileName}`} />
        </head>
        <body>
          <a href={`/uploads/catalogs/${catalog.fileName}`}>Click here if not redirected</a>
        </body>
      </html>
    );
  } catch {
    notFound();
  }
}