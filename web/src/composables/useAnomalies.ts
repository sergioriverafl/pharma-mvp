// frontend/src/composables/useAnomalies.ts
import { ref } from 'vue'
import { api } from '../services/api'

export interface Anomaly {
  id: string
  postId: string
  postTitle: string
  postUrl: string
  platform: string
  severity: 'high' | 'medium' | 'low'
  type: 'price' | 'packaging' | 'seller' | 'description'
  reason: string
  price: number
  seller: string
  confidence: number
  validated: boolean
  isFake?: boolean
  detectedAt: string
}

export function useAnomalies() {
  const anomalies = ref<Anomaly[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAnomalies = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/anomalies')
      anomalies.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar anomalías'
      console.error('Error fetching anomalies:', err)
      
      // Mock data for development
      anomalies.value = generateMockAnomalies()
      return anomalies.value
    } finally {
      loading.value = false
    }
  }

  const fetchAnomalyById = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/anomalies/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar anomalía'
      console.error('Error fetching anomaly:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateAnomaly = async (id: string, isFake: boolean) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/anomalies/${id}/validate`, { isFake })
      
      // Update local state
      const index = anomalies.value.findIndex(a => a.id === id)
      if (index !== -1) {
        anomalies.value[index] = {
          ...anomalies.value[index],
          validated: true,
          isFake
        }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al validar anomalía'
      console.error('Error validating anomaly:', err)
      
      // Mock validation for development
      const index = anomalies.value.findIndex(a => a.id === id)
      if (index !== -1) {
        anomalies.value[index] = {
          ...anomalies.value[index],
          validated: true,
          isFake
        }
      }
    } finally {
      loading.value = false
    }
  }

  return {
    anomalies,
    loading,
    error,
    fetchAnomalies,
    fetchAnomalyById,
    validateAnomaly
  }
}

// Mock data generator for development
function generateMockAnomalies(): Anomaly[] {
  const platforms = ['mercadolibre', 'amazon', 'facebook']
  const severities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
  const types: Array<'price' | 'packaging' | 'seller' | 'description'> = ['price', 'packaging', 'seller', 'description']
  
  const products = [
    { name: 'Paracetamol 500mg', normalPrice: 2500 },
    { name: 'Ibuprofeno 600mg', normalPrice: 3200 },
    { name: 'Amoxicilina 500mg', normalPrice: 8500 },
    { name: 'Omeprazol 20mg', normalPrice: 4100 },
    { name: 'Losartán 50mg', normalPrice: 5600 }
  ]

  const reasons = {
    price: [
      'Precio 70% por debajo del promedio de mercado',
      'Precio sospechosamente bajo para este producto regulado',
      'Descuento excesivo comparado con farmacias oficiales'
    ],
    packaging: [
      'Empaque no coincide con el formato original del fabricante',
      'Etiqueta con errores ortográficos y diseño irregular',
      'Fecha de vencimiento borrosa o manipulada'
    ],
    seller: [
      'Vendedor sin registro farmacéutico verificable',
      'Cuenta creada recientemente con múltiples productos farmacéuticos',
      'Vendedor no aparece en base de datos de distribuidores autorizados'
    ],
    description: [
      'Descripción contiene afirmaciones médicas no verificadas',
      'Promete efectos que no corresponden al medicamento',
      'Menciona "importado" sin datos de registro sanitario'
    ]
  }

  const sellers = ['FarmaExpress', 'MedicOnline', 'SaludTotal', 'FarmaBarato', 'MegaFarma']

  return Array.from({ length: 12 }, (_, i) => {
    const product = products[i % products.length]
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const platform = platforms[i % platforms.length]
    
    let price = product.normalPrice
    if (type === 'price') {
      price = Math.round(product.normalPrice * (Math.random() * 0.5 + 0.2)) // 20-70% del precio normal
    }

    return {
      id: `anomaly-${i + 1}`,
      postId: `post-${i + 1}`,
      postTitle: `${product.name} - Caja x 30 comprimidos`,
      postUrl: `https://${platform}.com/product/${i + 1}`,
      platform,
      severity,
      type,
      reason: reasons[type][Math.floor(Math.random() * reasons[type].length)],
      price,
      seller: sellers[Math.floor(Math.random() * sellers.length)],
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      validated: Math.random() > 0.6, // 40% validadas
      isFake: Math.random() > 0.3, // 70% son falsas cuando están validadas
      detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }).sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
}