<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/index.js'
import AlienCard from './AlienCard.vue'
import AddMasterAlienModal from './modals/AddMasterAlienModal.vue'
import EditAlienModal from './modals/EditAlienModal.vue'

const showAdd = ref(false)
const editId  = ref(null)
const search  = ref('')
const rankFilter = ref('ALL')

const RANKS = ['ALL', 'SSS', 'S', 'A', 'B', 'C', 'D']

const rankBadge = {
  ALL: 'bg-[#1e2530] text-slate-200 border-[#3a4555]',
  SSS: 'bg-purple-900/50 text-purple-200 border-purple-500/50',
  S:   'bg-red-900/50    text-red-200    border-red-500/50',
  A:   'bg-yellow-900/50 text-yellow-200 border-yellow-500/50',
  B:   'bg-blue-900/50   text-blue-200   border-blue-500/50',
  C:   'bg-slate-700/60  text-slate-200  border-slate-500/50',
  D:   'bg-slate-800/60  text-slate-300  border-slate-600/50',
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return Object.entries(store.masterAliens).filter(([id, a]) => {
    const matchRank = rankFilter.value === 'ALL' || a.rank === rankFilter.value
    const matchSearch = !q
      || id.toLowerCase().includes(q)
      || (a.name || '').toLowerCase().includes(q)
      || (a.species || '').toLowerCase().includes(q)
    return matchRank && matchSearch
  })
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- toolbar -->
    <div class="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#2a3340]">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="section-title">Master Aliens</h2>
          <p class="text-sm text-slate-400 font-medium mt-1">Template กลาง — player จะก็อป base stats จากที่นี่</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-outline btn btn-sm" @click="store.loadMasterAliens()">↻ Refresh</button>
          <button class="btn-primary btn btn-sm" @click="showAdd = true">+ New Template</button>
        </div>
      </div>

      <!-- search bar -->
      <div class="relative mb-3">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          v-model="search"
          class="input pl-8"
          placeholder="Search by name, ID, or species..."
        />
        <button v-if="search"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
          @click="search = ''"
        >✕</button>
      </div>

      <!-- rank filters -->
      <div class="flex gap-1.5 flex-wrap">
        <button
          v-for="r in RANKS" :key="r"
          class="px-3 py-1 rounded-full text-xs font-black border tracking-wider transition-all"
          :class="rankFilter === r
            ? rankBadge[r] + ' ring-1 ring-white/20'
            : 'bg-transparent text-slate-400 border-[#3a4555] hover:border-slate-400 hover:text-slate-200'"
          @click="rankFilter = r"
        >{{ r }}</button>
        <span class="ml-auto text-sm text-slate-400 font-semibold self-center">
          {{ filtered.length }} / {{ Object.keys(store.masterAliens).length }}
        </span>
      </div>
    </div>

    <!-- grid -->
    <div class="flex-1 overflow-y-auto px-6 py-4">
      <p v-if="!Object.keys(store.masterAliens).length"
         class="text-center text-slate-500 font-semibold py-24">
        No master aliens yet.<br />
        <span class="text-slate-300">Click <strong>+ New Template</strong> to create one.</span>
      </p>
      <p v-else-if="!filtered.length"
         class="text-center text-slate-500 font-semibold py-24">
        No aliens match <strong class="text-slate-300">"{{ search }}"</strong>
        <span v-if="rankFilter !== 'ALL'"> with rank <strong class="text-slate-300">{{ rankFilter }}</strong></span>
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <AlienCard
          v-for="[id, alien] in filtered"
          :key="id"
          :alien-id="id"
          :alien="alien"
          :is-active="false"
          :show-master-badge="true"
          @edit="editId = $event"
        />
      </div>
    </div>

  </div>

  <AddMasterAlienModal v-if="showAdd" @close="showAdd = false" />
  <EditAlienModal v-if="editId" :alien-id="editId" :is-master="true" @close="editId = null" />
</template>
