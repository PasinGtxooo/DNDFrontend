<script setup>
import { ref, onMounted } from 'vue'
import { store } from './store/index.js'
import { apiBase } from './composables/useApi.js'
import PlayerSidebar from './components/PlayerSidebar.vue'
import PlayerView from './components/PlayerView.vue'
import MasterAliensView from './components/MasterAliensView.vue'
import DiceRoller from './components/DiceRoller.vue'
import ToastContainer from './components/ui/ToastContainer.vue'

const showDice = ref(false)

onMounted(async () => {
  await store.loadPlayers()
  await store.loadMasterAliens()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-bg font-rajdhani text-[#e8edf5]">

    <!-- Header -->
    <header class="flex items-center justify-between px-6 h-16 bg-surface border-b border-[#2a3340] shadow-lg flex-shrink-0 z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full border-[3px] border-omni shadow-omni-lg flex items-center justify-center text-xl"
          style="background: radial-gradient(circle at 40% 35%, #00e676, #007a3d 60%, #001a0d)">⬡</div>
        <span class="font-cinzel font-black text-xl tracking-[3px] bg-gradient-to-br from-omni to-green-300 bg-clip-text text-transparent">
          OMNITRIX DND
        </span>
      </div>

      <!-- nav tabs -->
      <div class="flex gap-1 bg-surface-2 border border-[#2a3340] rounded-lg p-1">
        <button
          class="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all"
          :class="store.view === 'players' ? 'bg-omni-dark text-omni shadow-omni' : 'text-slate-400 hover:text-white'"
          @click="store.view = 'players'"
        >Players</button>
        <button
          class="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all"
          :class="store.view === 'master' ? 'bg-omni-dark text-omni shadow-omni' : 'text-slate-400 hover:text-white'"
          @click="store.view = 'master'"
        >Master Aliens</button>
      </div>

      <div class="flex items-center gap-2">
        <!-- dice button -->
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide border transition-all"
          :class="showDice
            ? 'bg-omni-dark border-omni text-omni shadow-omni'
            : 'border-[#3a4555] text-slate-300 hover:border-omni hover:text-omni'"
          @click="showDice = !showDice"
        >🎲 Dice</button>

        <span class="text-xs font-bold uppercase tracking-widest text-slate-500">API</span>
        <input v-model="apiBase" class="input w-48 text-xs font-mono py-1.5" placeholder="http://localhost:5000" />
        <button class="btn-outline btn btn-sm" @click="store.loadPlayers(); store.loadMasterAliens()">↻</button>
      </div>
    </header>

    <!-- Body -->
    <div class="flex flex-1 overflow-hidden">
      <div v-if="store.view === 'players'" class="w-[280px] flex-shrink-0 overflow-hidden">
        <PlayerSidebar />
      </div>
      <main class="flex-1 overflow-hidden">
        <template v-if="store.view === 'players'">
          <PlayerView v-if="store.selectedId" />
          <div v-else class="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <div class="w-20 h-20 rounded-full border-[3px] border-[#2a3340] bg-surface-2 flex items-center justify-center text-4xl mb-4">⬡</div>
            <h2 class="font-cinzel text-xl text-slate-600 mb-2">Select a Player</h2>
            <p class="text-sm font-semibold">Choose a player from the sidebar to view their stats and aliens</p>
          </div>
        </template>
        <MasterAliensView v-else-if="store.view === 'master'" />
      </main>
    </div>
  </div>

  <DiceRoller v-if="showDice" @close="showDice = false" />
  <ToastContainer />
</template>
