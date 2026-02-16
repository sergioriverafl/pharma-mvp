export interface ScrapedPost {
  id: string;
  platform: "mercadolibre";
  title: string;
  price: number;
  currency: string;
  seller: string;
  imageUrl: string;
  productUrl: string;
  description?: string;
  scrapedAt: string;
}

export interface ScraperConfig {
  searchQuery: string;
  maxResults: number;
  headless: boolean;
}

export interface ScraperResult {
  posts: ScrapedPost[];
  totalFound: number;
  errors: string[];
}
