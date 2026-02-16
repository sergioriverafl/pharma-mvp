import { Processor } from './processor';
import { PostAnalysisInput } from './providers/types';

// Configurar para usar Mock Provider localmente
process.env.AI_PROVIDER = 'mock';

const testPost: PostAnalysisInput = {
  postId: 'ML-TEST-001',
  platform: 'mercadolibre',
  title: 'Paracetamol 500mg - Original Importado',
  description: 'Producto 100% efectivo, garantizado. Precio increíble!',
  price: 5.99,
  currency: 'USD',
  sellerName: 'FarmaExpress2024',
  sellerRating: 2.8,
  imageUrls: ['https://example.com/image1.jpg']
};

async function runTest() {
  console.log('Testing AI Processor locally...\n');
  console.log('Input:', JSON.stringify(testPost, null, 2));
  
  const processor = new Processor();
  
  try {
    await processor.processPost(testPost);
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('\nTest failed:', error);
    process.exit(1);
  }
}

runTest();
