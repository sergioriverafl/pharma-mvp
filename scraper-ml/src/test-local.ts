import { MercadoLibreScraper } from "./scraper";

async function testScraper() {
  console.log("Iniciando scraper local...\n");

  const scraper = new MercadoLibreScraper();

  try {
    // Inicializar con navegador visible (headless = false)
    console.log("Abriendo navegador...");
    await scraper.initialize(false);

    console.log("Buscando productos...\n");

    const result = await scraper.scrape({
      searchQuery: "buscapina",
      maxResults: 10,
      headless: false,
    });

    console.log("\n Scraping completado!\n");
    console.log(`Total encontrados: ${result.totalFound}`);
    console.log(`Errores: ${result.errors.length}\n`);

    if (result.errors.length > 0) {
      console.log("Errores encontrados:");
      result.errors.forEach((err) => console.log(`  - ${err}`));
      console.log("");
    }

    console.log(result.posts);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // await scraper.close();
    console.log("Navegador cerrado");
  }
}

// Ejecutar
testScraper().catch(console.error);
