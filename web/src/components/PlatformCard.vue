
<template>
  <div class="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
    <div class="flex items-center gap-3">
      <div
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
          platformConfig[platform.name]?.bgColor || 'bg-gray-100'
        ]"
      >
        {{ platformConfig[platform.name]?.icon || '📦' }}
      </div>

      <div>
        <h3 class="font-semibold text-gray-900">{{ platform.name }}</h3>
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span>{{ platform.posts }} posts</span>
          <span class="text-gray-300">•</span>
          <span :class="platform.anomalies > 0 ? 'text-red-600 font-medium' : ''">
            {{ platform.anomalies }} anomalías
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span
        :class="[
          'px-2 py-1 rounded-full text-xs font-medium',
          statusConfig[platform.status]?.classes || 'bg-gray-100 text-gray-600'
        ]"
      >
        <span class="mr-1">{{ statusConfig[platform.status]?.icon || '○' }}</span>
        {{ statusConfig[platform.status]?.label || 'Desconocido' }}
      </span>

      <button
        v-if="platform.status === 'active'"
        @click="$emit('view-platform', platform.name)"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Platform {
  name: string
  posts: number
  anomalies: number
  status: 'active' | 'inactive' | 'error'
}

interface Props {
  platform: Platform
}

defineProps<Props>()
defineEmits<{
  (e: 'view-platform', name: string): void
}>()

const platformConfig: Record<string, { icon: string; bgColor: string }> = {
  'MercadoLibre': {
    icon: '🛒',
    bgColor: 'bg-yellow-100'
  },
  'Amazon': {
    icon: '📦',
    bgColor: 'bg-orange-100'
  },
  'Facebook': {
    icon: '👥',
    bgColor: 'bg-blue-100'
  }
}

const statusConfig: Record<string, { label: string; icon: string; classes: string }> = {
  active: {
    label: 'Activo',
    icon: '●',
    classes: 'bg-green-100 text-green-700'
  },
  inactive: {
    label: 'Inactivo',
    icon: '○',
    classes: 'bg-gray-100 text-gray-600'
  },
  error: {
    label: 'Error',
    icon: '⚠',
    classes: 'bg-red-100 text-red-700'
  }
}
</script>