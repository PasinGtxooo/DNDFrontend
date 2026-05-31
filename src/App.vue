<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from './store/index.js'
import { apiBase } from './composables/useApi.js'
import PlayerSidebar from './components/PlayerSidebar.vue'
import PlayerView from './components/PlayerView.vue'
import MasterAliensView from './components/MasterAliensView.vue'
import CharactersView from './components/CharactersView.vue'
import SessionsView from './components/SessionsView.vue'
import DiceRoller from './components/DiceRoller.vue'
import ToastContainer from './components/ui/ToastContainer.vue'

const showDice    = ref(false)
const showSidebar = ref(false)   // mobile drawer

onMounted(async () => {
  await store.loadPlayers()
  await store.loadMasterAliens()
  store.loadCharacters()
  store.loadSessions()
  store.startAutoRefresh()
})

onUnmounted(() => store.stopAutoRefresh())

function selectPlayer(id) {
  store.selectPlayer(id)
  showSidebar.value = false  // close drawer after picking
}
</script>

<template>
  <div class="flex flex-col h-screen bg-bg font-rajdhani text-[#f0f4ff] overflow-hidden">

    <!-- ── HEADER ── -->
    <header class="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 bg-surface border-b border-[#2a3340] shadow-lg flex-shrink-0 z-20">

      <!-- left: burger (mobile) + logo -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <button class="sm:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-[#3a4555] text-slate-300 hover:text-omni hover:border-omni transition-all"
                @click="showSidebar = true">☰</button>
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-[3px] border-omni shadow-omni-lg flex items-center justify-center text-base sm:text-xl flex-shrink-0"
             style="background:radial-gradient(circle at 40% 35%,#00e676,#007a3d 60%,#001a0d)"><img src="/Img/logo.png" alt="" class="w-full h-full object-cover rounded-full" /></div>
        <span class="font-cinzel font-black text-base sm:text-xl tracking-[2px] sm:tracking-[3px] bg-gradient-to-br from-omni to-green-300 bg-clip-text text-transparent truncate">
          OMNITRIX DND
        </span>
      </div>

      <!-- center: nav tabs (hidden on xs) -->
      <div class="hidden sm:flex gap-1 bg-surface-2 border border-[#2a3340] rounded-lg p-1">
        <button class="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all"
          :class="store.view==='players' ? 'bg-omni-dark text-omni shadow-omni' : 'text-slate-400 hover:text-white'"
          @click="store.view='players'">Players</button>
        <button class="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all"
          :class="store.view==='master' ? 'bg-omni-dark text-omni shadow-omni' : 'text-slate-400 hover:text-white'"
          @click="store.view='master'">Master Aliens</button>
        <button class="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all"
          :class="store.view==='characters' ? 'bg-omni-dark text-omni shadow-omni' : 'text-slate-400 hover:text-white'"
          @click="store.view='characters'">Characters</button>
        <button class="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all"
          :class="store.view==='sessions' ? 'bg-omni-dark text-omni shadow-omni' : 'text-slate-400 hover:text-white'"
          @click="store.view='sessions'">Sessions</button>
      </div>

      <!-- right: dice + refresh -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button class="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide border transition-all"
          :class="showDice ? 'bg-omni-dark border-omni text-omni shadow-omni' : 'border-[#3a4555] text-slate-300 hover:border-omni hover:text-omni'"
          @click="showDice=!showDice">🎲 <span class="hidden sm:inline">Dice</span></button>
        <button class="btn-outline btn btn-sm hidden sm:flex"
          @click="store.loadPlayers();store.loadMasterAliens()">↻</button>
      </div>
    </header>

    <!-- mobile nav tabs -->
    <div class="flex sm:hidden border-b border-[#2a3340] bg-surface flex-shrink-0">
      <button class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all"
        :class="store.view==='players' ? 'text-omni border-b-2 border-omni' : 'text-slate-500'"
        @click="store.view='players'">Players</button>
      <button class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all"
        :class="store.view==='master' ? 'text-omni border-b-2 border-omni' : 'text-slate-500'"
        @click="store.view='master'">Master Aliens</button>
      <button class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all"
        :class="store.view==='characters' ? 'text-omni border-b-2 border-omni' : 'text-slate-500'"
        @click="store.view='characters'">Characters</button>
      <button class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all"
        :class="store.view==='sessions' ? 'text-omni border-b-2 border-omni' : 'text-slate-500'"
        @click="store.view='sessions'">Sessions</button>
    </div>

    <!-- ── BODY ── -->
    <div class="flex flex-1 overflow-hidden relative">

      <!-- mobile sidebar overlay -->
      <Transition name="fade">
        <div v-if="showSidebar" class="absolute inset-0 bg-black/60 z-30 sm:hidden"
             @click="showSidebar=false" />
      </Transition>

      <!-- sidebar -->
      <Transition name="slide">
        <div class="absolute sm:relative w-80 sm:w-[340px] h-full z-40 sm:z-auto flex-shrink-0 overflow-hidden"
             :class="showSidebar ? 'left-0' : '-left-80 sm:left-0'"
             v-show="showSidebar || true">
          <div class="absolute sm:relative inset-0"
               :class="{'translate-x-0': showSidebar, '-translate-x-full sm:translate-x-0': !showSidebar}"
               style="transition: transform 0.25s ease">
            <PlayerSidebar @select="selectPlayer" />
          </div>
        </div>
      </Transition>

      <!-- main -->
      <main class="flex-1 overflow-hidden min-w-0">
        <template v-if="store.view==='players'">
          <PlayerView v-if="store.selectedId" />
          <div v-else class="flex flex-col items-center justify-center h-full text-center text-slate-500 px-6">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#2a3340] bg-surface-2 flex items-center justify-center text-3xl sm:text-4xl mb-4">⬡</div>
            <h2 class="font-cinzel text-lg sm:text-xl text-slate-600 mb-2">Select a Player</h2>
            <p class="text-sm font-semibold">
              <span class="sm:hidden">Tap ☰ to open the player list</span>
              <span class="hidden sm:inline">Choose a player from the sidebar</span>
            </p>
          </div>
        </template>
        <MasterAliensView  v-else-if="store.view==='master'" />
        <CharactersView    v-else-if="store.view==='characters'" />
        <SessionsView      v-else-if="store.view==='sessions'" />
      </main>
    </div>
  </div>

  <DiceRoller v-if="showDice" @close="showDice=false" />
  <ToastContainer />
</template>

<style scoped>
.fade-enter-active,.fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from,.fade-leave-to { opacity: 0; }
</style>
