import { ref } from 'vue'
import { api } from '../services/api'

export interface Post {
  id: string
  platform: string
  title: string
  description: string
  price: number
  currency: string
  imageUrl: string
  postUrl: string
  seller: {
    name: string
    id: string
    reputation?: number
  }
  status: 'pending' | 'analyzed' | 'validated'
  hasAnomaly: boolean
  anomalyDetails?: {
    severity: 'high' | 'medium' | 'low'
    type: 'price' | 'packaging' | 'seller' | 'description'
    reason: string
    confidence: number
  }
  createdAt: string
  analyzedAt?: string
  metadata?: {
    views?: number
    sold?: number
    location?: string
  }
}

export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPosts = async (params?: {
    platform?: string
    status?: string
    hasAnomaly?: boolean
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/posts', { params })
      posts.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar posts'
      console.error('Error fetching posts:', err)
      
      // Mock data for development
      posts.value = generateMockPosts()
      return posts.value
    } finally {
      loading.value = false
    }
  }

  const fetchPostById = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/posts/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar post'
      console.error('Error fetching post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePostStatus = async (id: string, status: Post['status']) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/posts/${id}`, { status })
      
      // Update local state
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = {
          ...posts.value[index],
          status
        }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar post'
      console.error('Error updating post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    fetchPostById,
    updatePostStatus
  }
}

// Mock data generator for development
function generateMockPosts(): Post[] {
  const platforms = ['mercadolibre', 'amazon', 'facebook']
  const statuses: Array<'pending' | 'analyzed' | 'validated'> = ['pending', 'analyzed', 'validated']
  
  const products = [
    { name: 'Paracetamol 500mg', normalPrice: 2500, image: 'https://placehold.co/400x400/e3f2fd/1976d2?text=Paracetamol' },
    { name: 'Ibuprofeno 600mg', normalPrice: 3200, image: 'https://placehold.co/400x400/fff3e0/f57c00?text=Ibuprofeno' },
    { name: 'Amoxicilina 500mg', normalPrice: 8500, image: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=Amoxicilina' },
    { name: 'Omeprazol 20mg', normalPrice: 4100, image: 'https://placehold.co/400x400/e8f5e9/388e3c?text=Omeprazol' },
    { name: 'Losartán 50mg', normalPrice: 5600, image: 'https://placehold.co/400x400/fce4ec/c2185b?text=Losartan' },
    { name: 'Atorvastatina 20mg', normalPrice: 6200, image: 'https://placehold.co/400x400/e0f2f1/00897b?text=Atorvastatina' },
    { name: 'Metformina 850mg', normalPrice: 3800, image: 'https://placehold.co/400x400/fff9c4/f9a825?text=Metformina' },
    { name: 'Enalapril 10mg', normalPrice: 4500, image: 'https://placehold.co/400x400/e1f5fe/0288d1?text=Enalapril' },
    { name: 'Levotiroxina 100mcg', normalPrice: 5100, image: 'https://placehold.co/400x400/fbe9e7/d84315?text=Levotiroxina' },
    { name: 'Clonazepam 2mg', normalPrice: 7800, image: 'https://placehold.co/400x400/ede7f6/5e35b1?text=Clonazepam' }
  ]

  const sellers = [
    { name: 'FarmaExpress', reputation: 98 },
    { name: 'MedicOnline', reputation: 95 },
    { name: 'SaludTotal', reputation: 92 },
    { name: 'FarmaBarato', reputation: 78 },
    { name: 'MegaFarma', reputation: 88 },
    { name: 'DrugStore AR', reputation: 85 }
  ]

  const descriptions = [
    'Producto original sellado. Entrega inmediata. Consulte stock disponible.',
    'Venta de medicamentos con receta. Laboratorio reconocido.',
    'Importado directo. Precio mayorista. Gran oportunidad.',
    'Stock limitado. Oferta especial por cambio de proveedor.',
    'Medicamento genérico de alta calidad. Mismo principio activo.',
    'Producto nacional. Registro ANMAT vigente. Envío a todo el país.'
  ]

  return Array.from({ length: 24 }, (_, i) => {
    const product = products[i % products.length]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const platform = platforms[i % platforms.length]
    const seller = sellers[Math.floor(Math.random() * sellers.length)]
    const hasAnomaly = Math.random() > 0.65 // 35% con anomalías
    
    let price = product.normalPrice
    let anomalyDetails = undefined

    if (hasAnomaly && status === 'analyzed') {
      const anomalyTypes: Array<'price' | 'packaging' | 'seller' | 'description'> = ['price', 'packaging', 'seller', 'description']
      const severities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
      const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]

      if (type === 'price') {
        price = Math.round(product.normalPrice * (Math.random() * 0.5 + 0.2))
      }

      const reasons = {
        price: 'Precio significativamente inferior al promedio del mercado',
        packaging: 'Empaque no coincide con formato original del fabricante',
        seller: 'Vendedor sin verificación farmacéutica',
        description: 'Descripción contiene afirmaciones médicas no verificadas'
      }

      anomalyDetails = {
        severity,
        type,
        reason: reasons[type],
        confidence: Math.floor(Math.random() * 25) + 75 // 75-100%
      }
    }

    return {
      id: `post-${i + 1}`,
      platform,
      title: `${product.name} - Caja x 30 comprimidos`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      price,
      currency: 'ARS',
      imageUrl: product.image,
      postUrl: `https://${platform}.com/product/${i + 1}`,
      seller: {
        name: seller.name,
        id: `seller-${Math.floor(Math.random() * 1000)}`,
        reputation: seller.reputation
      },
      status,
      hasAnomaly,
      anomalyDetails,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      analyzedAt: status !== 'pending' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      metadata: {
        views: Math.floor(Math.random() * 5000),
        sold: Math.floor(Math.random() * 100),
        location: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'][Math.floor(Math.random() * 4)]
      }
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}