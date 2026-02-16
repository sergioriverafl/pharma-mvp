import { MockProvider } from './providers/mock.provider';
import { PostAnalysisInput } from './providers/types';

// Casos de prueba
const testCases: PostAnalysisInput[] = [
  {
    postId: 'ML-001',
    platform: 'mercadolibre',
    title: 'Ibuprofeno 400mg - Caja x 20 tabletas',
    description: 'Producto farmacéutico de alta calidad',
    price: 12.50,
    currency: 'USD',
    sellerName: 'Farmacia Central',
    sellerRating: 4.8,
    imageUrls: ['https://example.com/ibuprofen.jpg']
  },
  {
    postId: 'ML-002',
    platform: 'mercadolibre',
    title: 'Paracetamol ORIGINAL IMPORTADO!!!',
    description: '100% efectivo, garantizado, el mejor precio del mercado',
    price: 3.99,
    currency: 'USD',
    sellerName: 'VendedorRapido123',
    sellerRating: 2.1,
    imageUrls: ['https://example.com/paracetamol.jpg']
  },
  {
    postId: 'ML-003',
    platform: 'mercadolibre',
    title: 'Aspirina 500mg - Precio especial',
    description: 'Aspirina marca reconocida, envío rápido',
    price: 1500.00,
    currency: 'USD',
    sellerName: 'MegaFarma',
    sellerRating: 4.5,
    imageUrls: ['https://example.com/aspirin.jpg']
  }
];

async function demo() {
  console.log('AI Processor Demo\n');
  console.log('Testing with MockProvider (no AWS required)\n');
  console.log('═'.repeat(80));

  const provider = new MockProvider();

  for (const testCase of testCases) {
    console.log(`\nAnalyzing: ${testCase.title}`);
    console.log(`Platform: ${testCase.platform}`);
    console.log(`Price: ${testCase.currency} ${testCase.price}`);
    console.log(`Seller: ${testCase.sellerName} (${testCase.sellerRating}⭐)`);
    
    const result = await provider.analyze(testCase);
    
    console.log(`\n Result:`);
    console.log(`├─ Is Anomaly: ${result.isAnomaly ? 'YES' : 'NO'}`);
    console.log(`├─ Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`└─ Anomalies Found: ${result.anomalies.length}`);
    
    if (result.anomalies.length > 0) {
      result.anomalies.forEach((anomaly, index) => {
        console.log(`\n${index + 1}. ${anomaly.type.toUpperCase()} - ${anomaly.severity}`);
        console.log(`${anomaly.description}`);
        console.log(`Evidence: ${anomaly.evidence}`);
      });
    }
    
    console.log('\n' + '─'.repeat(80));
  }

  console.log('\nDemo completed!\n');
}

demo().catch(console.error);
