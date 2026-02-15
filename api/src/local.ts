import { buildApp } from "@/app.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: PORT, host: HOST });

    console.log(`
🚀 Server ready at http://${HOST}:${PORT}
📊 Health check: http://${HOST}:${PORT}/health
📚 API base: http://${HOST}:${PORT}/api/v1
    `);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();
