<template>
  <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
       @click="navigateToAnomaly">
    <div class="flex-shrink-0">
      <div
        :class="[
          'w-2 h-2 rounded-full mt-2',
          severityColor[anomaly.severity]
        ]"
      ></div>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span
          :class="[
            'px-2 py-0.5 rounded text-xs font-medium',
            severityBadge[anomaly.severity]
          ]"
        >
          {{ severityLabel[anomaly.severity] }}
        </span>
        <span class="text-xs text-gray-500">{{ typeLabel[anomaly.type] }}</span>
      </div>

      <h4 class="text-sm font-medium text-gray-900 truncate mb-1">
        {{ anomaly.postTitle }}
      </h4>

      <p class="text-xs text-gray-600 line-clamp-2 mb-2">
        {{ anomaly.reason }}
      </p>

      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500">
          {{ formatTimeAgo(anomaly.detectedAt) }}
        </span>
        <span
          v-if="!anomaly.validated"
          class="text-blue-600 font-medium"
        >
          Pendiente →
        </span>
        <span
          v-else
          class="text-green-600 font-medium"
        >
          ✓ Validado
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Anomaly {
  id: string
  postTitle: string
  severity: 'high' | 'medium' | 'low'
  type: 'price' | 'packaging' | 'seller' | 'description'
  reason: string
  validated: boolean
  detectedAt: string
}

interface Props {
  anomaly: Anomaly
}

const props = defineProps<Props>()
const router = useRouter()

const severityColor = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500'
}

const severityBadge = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700'
}

const severityLabel = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
}

const typeLabel = {
  price: 'Precio',
  packaging: 'Empaque',
  seller: 'Vendedor',
  description: 'Descripción'
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hace unos segundos'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}

const navigateToAnomaly = () => {
  router.push('/anomalies')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>