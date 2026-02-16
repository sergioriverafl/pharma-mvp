import { chromium, Browser, Page } from "playwright-core";
import chromium_pkg from "@sparticuz/chromium";
import { ScrapedPost, ScraperConfig, ScraperResult } from "./types";
import { config } from "./config";

export class MercadoLibreScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(headless = true): Promise<void> {
    let executablePath: string;

    // Detectar si estamos en local o Lambda
    const isLocal = !process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isLocal) {
      // Usar Chromium del sistema en local
      executablePath =
        process.env.BROWSER_LOCAL_EXECUTE_PATH || "/opt/homebrew/bin/chromium";
      console.log("🏠 Modo local - usando Chromium del sistema");
    } else {
      // Usar @sparticuz/chromium en Lambda
      executablePath = await chromium_pkg.executablePath();
      console.log("☁️  Modo Lambda - usando @sparticuz/chromium");
    }

    console.log(`🌐 Executable path: ${executablePath}`);

    this.browser = await chromium.launch({
      args: isLocal ? [] : chromium_pkg.args,
      executablePath,
      headless,
    });

    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async scrape(scraperConfig: ScraperConfig): Promise<ScraperResult> {
    if (!this.page) throw new Error("Browser not initialized");

    const errors: string[] = [];
    const posts: ScrapedPost[] = [];

    try {
      const url =
        config.mercadolibre.baseUrl +
        config.mercadolibre.searchPath(scraperConfig.searchQuery);

      console.log(url);


      await this.page.goto(url, {
        waitUntil: "networkidle",
        timeout: config.scraper.navigationTimeout,
      });
      console.log(config.mercadolibre.selectors.item);
      // Esperar a que carguen los items
      await this.page.waitForSelector(config.mercadolibre.selectors.item, {
        timeout: config.scraper.timeout,
      });

      // Extraer items
      const items = await this.page.$$(config.mercadolibre.selectors.item);

      console.log(items);
      const limit = Math.min(items.length, scraperConfig.maxResults);

      // for (let i = 0; i < limit; i++) {
      //   try {
      //     const post = await this.extractPost(items[i], i);
      //     if (post) posts.push(post);
      //   } catch (err) {
      //     errors.push(`Error extracting item ${i}: ${err}`);
      //   }
      // }
    } catch (err) {
      errors.push(`Scraping failed: ${err}`);
    }

    return {
      posts,
      totalFound: posts.length,
      errors,
    };
  }

  private async extractPost(
    element: any,
    index: number,
  ): Promise<ScrapedPost | null> {
    try {
      const title = await element.$eval(
        config.mercadolibre.selectors.title,
        (el: any) => el.textContent?.trim(),
      );

      const priceText = await element.$eval(
        config.mercadolibre.selectors.price,
        (el: any) => el.textContent?.trim(),
      );

      const currency = await element
        .$eval(config.mercadolibre.selectors.currency, (el: any) =>
          el.textContent?.trim(),
        )
        .catch(() => "COP");

      const imageUrl = await element.$eval(
        config.mercadolibre.selectors.image,
        (el: any) => el.src || el.dataset.src,
      );

      const productUrl = await element.$eval(
        config.mercadolibre.selectors.link,
        (el: any) => el.href,
      );

      const seller = await element
        .$eval(config.mercadolibre.selectors.seller, (el: any) =>
          el.textContent?.trim(),
        )
        .catch(() => "Unknown");

      if (!title || !priceText || !imageUrl || !productUrl) {
        return null;
      }

      // Limpiar precio
      const price = parseFloat(priceText.replace(/\./g, "").replace(",", "."));

      // Generar ID único
      const id = `ml_${Date.now()}_${index}`;

      return {
        id,
        platform: "mercadolibre",
        title,
        price,
        currency: currency || "COP",
        seller,
        imageUrl,
        productUrl,
        scrapedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Error extracting post:", err);
      return null;
    }
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

export async function scrapeMercadoLibre(
  query: string,
  maxResults = 50,
): Promise<ScraperResult> {
  const scraper = new MercadoLibreScraper();

  try {
    await scraper.initialize(true);

    const result = await scraper.scrape({
      searchQuery: query,
      maxResults,
      headless: true,
    });

    return result;
  } finally {
    await scraper.close();
  }
}
