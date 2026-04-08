export interface ScrapedProduct {
  name: string;
  description: string;
  price: number | null;
  images: string[];
  variants: {
    name: string;
    price: number | null;
  }[];
  category: string;
  supplierUrl: string;
  supplierSku: string | null;
  specs: Record<string, string>;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  scrapeProduct: (url: string) => Promise<ScrapedProduct>;
  scrapeCollection: (url: string) => Promise<{ name: string; url: string }[]>;
}
