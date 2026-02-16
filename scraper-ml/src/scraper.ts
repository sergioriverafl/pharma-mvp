import { chromium, Browser, Page } from "playwright-core";
import chromium_pkg from "@sparticuz/chromium";
import { ScrapedPost, ScraperConfig, ScraperResult } from "./types";

export class MercadoLibreScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(headless = true): Promise<void> {
    const isLocal = !process.env.AWS_LAMBDA_FUNCTION_NAME;
    const executablePath = isLocal
      ? process.env.BROWSER_LOCAL_EXECUTE_PATH || "/opt/homebrew/bin/chromium"
      : await chromium_pkg.executablePath();

    console.log(isLocal ? "Local" : "Lambda");

    this.browser = await chromium.launch({
      args: isLocal
        ? ["--disable-blink-features=AutomationControlled"]
        : chromium_pkg.args,
      executablePath,
      headless,
    });

    this.page = await this.browser.newPage();

    await this.page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "es-CO,es;q=0.9",
    });

    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async scrape(config: ScraperConfig): Promise<ScraperResult> {
    if (!this.page) throw new Error("Browser not initialized");

    const posts: ScrapedPost[] = [];
    const errors: string[] = [];

    try {
      const url = `https://listado.mercadolibre.com.co/${config.searchQuery}`;
      console.log(`${url}`);

      await this.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await this.page.waitForTimeout(3000);

      // Cerrar modal de ubicación
      try {
        const closeBtn = await this.page.$('button:has-text("Más tarde")');
        if (closeBtn) {
          await closeBtn.click();
          console.log("Modal cerrado");
          await this.page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log("Sin modal");
      }

      await this.page.screenshot({
        path: "./screenshots/mercadolibre-final.png",
      });

      // Extraer productos
      const items = await this.page.evaluate(() => {
        const results: any[] = [];

        // Selector exacto del HTML
        const productCards = document.querySelectorAll(
          "li.ui-search-layout__item",
        );

        console.log(`🔍 Cards encontradas: ${productCards.length}`);

        productCards.forEach((card, idx) => {
          // Título está en h3 con clase poly-component__title
          const titleEl =
            card.querySelector("h3.poly-component__title") ||
            (card.querySelector("h2") as HTMLElement);

          // Link principal del producto
          const linkEl = card.querySelector(
            "a.poly-component__title",
          ) as HTMLAnchorElement | null;

          // Precio
          const priceEl = card.querySelector(".andes-money-amount__fraction");
          console.log(priceEl);

          // Imagen
          const imgEl = card.querySelector("img") as HTMLImageElement | null;

          // Vendedor
          const sellerEl = card.querySelector(".poly-component__seller");

          const priceText = priceEl?.textContent?.replace(/\./g, "") || "0";

          results.push({
            id: `ml_${Date.now()}_${idx}`,
            platform: "mercadolibre",
            title: titleEl?.textContent?.trim() || "",
            price: priceText,
            currency: "COP",
            seller: sellerEl?.textContent?.trim() || "MercadoLibre",
            imageUrl: imgEl?.src || imgEl?.getAttribute("data-src") || "",
            productUrl: linkEl?.href,
            scrapedAt: new Date().toISOString(),
          });
        });

        console.log(`Extraídos: ${results.length}`);
        return results;
      });
      // console.log(items);
      posts.push(...items.slice(0, config.maxResults));
      console.log(`Total: ${posts.length} productos`);
    } catch (err) {
      errors.push(`Error: ${err}`);
      console.error("Error: ", err);
    }

    return { posts, totalFound: posts.length, errors };
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
