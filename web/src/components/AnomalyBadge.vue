<template>
  <div class="flex items-center gap-2">
    <!-- Severity Badge -->
    <span
      :class="[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        severityClasses[severity]
      ]"
    >
      <span class="mr-1">{{ severityIcon[severity] }}</span>
      {{ severityLabel[severity] }}
    </span>

    <!-- Type Badge -->
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
    >
      <span class="mr-1">{{ typeIcon[type] }}</span>
      {{ typeLabel[type] }}
    </span>
  </div>
</template>

<script setup lang="ts">

interface Props {
  severity: 'high' | 'medium' | 'low'
  type: 'price' | 'packaging' | 'seller' | 'description'
}

const props = defineProps<Props>()

const severityClasses = {
  high: 'bg-red-100 text-red-800 border border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border border-blue-200'
}

const severityLabel = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
}

const severityIcon = {
  high: '🔴',
  medium: '🟡',
  low: '🔵'
}

const typeLabel = {
  price: 'Precio',
  packaging: 'Empaque',
  seller: 'Vendedor',
  description: 'Descripción'
}

const typeIcon = {
  price: '💰',
  packaging: '📦',
  seller: '👤',
  description: '📝'
}
</script>