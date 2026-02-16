export const config = {
  mercadolibre: {
    baseUrl: "https://listado.mercadolibre.com.co",
    searchPath: (query: string) => `/${encodeURIComponent(query)}`,
    selectors: {
      item: ".ui-search-layout__item",
      title: ".ui-search-item__title",
      price: ".andes-money-amount__fraction",
      currency: ".andes-money-amount__currency-symbol",
      image: ".ui-search-result-image__element",
      link: ".ui-search-link",
      seller: ".ui-search-item__group__element",
    },
  },
  scraper: {
    defaultMaxResults: 50,
    timeout: 30000,
    navigationTimeout: 20000,
  },
  sqs: {
    queueUrl: process.env.SQS_QUEUE_URL || "",
    batchSize: 10,
  },
};
