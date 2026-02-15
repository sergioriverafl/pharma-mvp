
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePosts } from '../composables/usePosts'
import PostList from '../components/PostList.vue'

const { posts, loading, fetchPosts } = usePosts()

const filters = ref({
  platform: '',
  status: '',
  hasAnomaly: '',
  search: ''
})

const sortBy = ref('date')

const filteredPosts = computed(() => {
  let result = posts.value

  if (filters.value.platform) {
    result = result.filter(p => p.platform === filters.value.platform)
  }

  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }

  if (filters.value.hasAnomaly) {
    const hasAnomaly = filters.value.hasAnomaly === 'true'
    result = result.filter(p => p.hasAnomaly === hasAnomaly)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(p => 
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    )
  }

  // Sorting
  if (sortBy.value === 'date') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (sortBy.value === 'price') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'anomaly') {
    result.sort((a, b) => (b.hasAnomaly ? 1 : 0) - (a.hasAnomaly ? 1 : 0))
  }

  return result
})

const resetFilters = () => {
  filters.value = {
    platform: '',
    status: '',
    hasAnomaly: '',
    search: ''
  }
}

onMounted(() => {
  fetchPosts()
})
</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <router-link to="/" class="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              ← Volver al Dashboard
            </router-link>
            <h1 class="text-3xl font-bold text-gray-900">Posts Analizados</h1>
            <p class="mt-1 text-sm text-gray-500">Revisa todas las publicaciones extraídas y analizadas</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Filters -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-wrap gap-4">
          <!-- Platform Filter -->
          <select
            v-model="filters.platform"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las plataformas</option>
            <option value="mercadolibre">MercadoLibre</option>
            <option value="amazon">Amazon</option>
            <option value="facebook">Facebook</option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="filters.status"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="analyzed">Analizados</option>
            <option value="validated">Validados</option>
          </select>

          <!-- Anomaly Filter -->
          <select
            v-model="filters.hasAnomaly"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="true">Con anomalías</option>
            <option value="false">Sin anomalías</option>
          </select>

          <!-- Search -->
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar por título o descripción..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            @click="resetFilters"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Results Info -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-sm text-gray-600">
          <span class="font-semibold text-gray-900">{{ filteredPosts.length }}</span> resultados encontrados
        </p>
        <select
          v-model="sortBy"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="date">Más recientes</option>
          <option value="price">Precio menor</option>
          <option value="anomaly">Con anomalías primero</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="space-y-3">
            <div class="h-48 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPosts.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron posts</h3>
        <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
      </div>

      <!-- Posts Grid -->
      <PostList v-else :posts="filteredPosts" />
    </main>
  </div>
</template>
