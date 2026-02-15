// frontend/src/components/dashboard/StatCard.vue
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div v-if="loading" class="animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-500">{{ title }}</span>
        <span class="text-2xl">{{ icon }}</span>
      </div>

      <div class="flex items-baseline gap-2">
        <span
          :class="[
            'text-3xl font-bold',
            alert ? 'text-red-600' : 'text-gray-900'
          ]"
        >
          {{ formatValue(value) }}
        </span>
      </div>

      <div v-if="trend" class="mt-2 flex items-center gap-1">
        <span
          :class="[
            'text-xs font-medium',
            getTrendColor()
          ]"
        >
          {{ trend }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  icon: string
  trend?: string
  alert?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alert: false,
  loading: false
})

const formatValue = (value: number | string): string => {
  if (typeof value === 'number') {
    return value.toLocaleString('es-AR')
  }
  return value
}

const getTrendColor = (): string => {
  if (!props.trend) return 'text-gray-500'
  
  // Check if trend indicates increase
  if (props.trend.includes('+')) {
    return props.alert ? 'text-red-600' : 'text-green-600'
  }
  
  // Check if trend indicates decrease
  if (props.trend.includes('-')) {
    return props.alert ? 'text-green-600' : 'text-red-600'
  }
  
  // Percentage or neutral trend
  return 'text-gray-600'
}
</script>