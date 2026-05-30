<script setup>
import { ref } from 'vue'
import { store } from '../store/index.js'
import { useToast } from '../composables/useToast.js'
import AddPlayerModal from './modals/AddPlayerModal.vue'

const showAdd = ref(false)
const { toast } = useToast()

async function removePlayer(e, id) {
  e.stopPropagation()
  if (!confirm(`Delete player "${store.players[id]?.name || id}"?`)) return
  try { await store.deletePlayer(id) }
  catch (err) { toast(err.message, 'error') }
}
</script>

<template>
  <aside class="flex flex-col bg-surface border-r border-[#2a3340] h-full">
    <div class="flex items-center justify-between px-4 pt-5 pb-3 border-b border-[#2a3340]">
      <span class="font-cinzel text-sm font-bold tracking-[3px] uppercase text-slate-200">Players</span>
      <button class="btn-primary btn btn-sm" @click="showAdd = true">+ Add</button>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-2">
      <p v-if="!Object.keys(store.players).length"
         class="text-center text-slate-400 font-semibold text-sm py-10 px-4">
        No players yet.<br />Click <strong class="text-slate-200">+ Add</strong> to create one.
      </p>

      <div
        v-for="(p, id) in store.players"
        :key="id"
        class="group relative px-3.5 py-3 rounded-lg mb-1 border cursor-pointer transition-all duration-150"
        :class="store.selectedId === id
          ? 'bg-omni-dark border-omni shadow-omni'
          : 'border-transparent hover:bg-surface-2 hover:border-[#3a4555]'"
        @click="store.selectPlayer(id)"
      >
        <!-- active bar -->
        <div v-if="store.selectedId === id"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-omni rounded-r" />

        <div class="font-bold text-base text-white pr-6 leading-tight">{{ p.name || id }}</div>
        <div class="text-sm text-slate-300 mt-1 font-medium">
          {{ p.hp != null && p.hp_max != null ? `HP ${p.hp}/${p.hp_max} · ` : '' }}Lv.{{ p.level ?? '?' }} · XP {{ p.xp ?? 0 }}
        </div>
        <div v-if="p.active_alien"
          class="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-omni-dark text-omni border border-omni-dim/50">
          <span class="w-1.5 h-1.5 rounded-full bg-omni animate-dot" />
          {{ p.active_alien }}
        </div>

        <button
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all text-sm p-1"
          @click="removePlayer($event, id)"
          title="Delete player"
        >✕</button>
      </div>
    </div>
  </aside>

  <AddPlayerModal v-if="showAdd" @close="showAdd = false" />
</template>
