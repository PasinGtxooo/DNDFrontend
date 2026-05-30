<script setup>
import { ref } from 'vue'
import { store } from '../store/index.js'
import { useToast } from '../composables/useToast.js'
import AddPlayerModal from './modals/AddPlayerModal.vue'
import PlayerAvatar from './ui/PlayerAvatar.vue'

const showAdd = ref(false)
const { toast } = useToast()
const emit = defineEmits(['select'])

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
        class="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 border cursor-pointer transition-all duration-150"
        :class="store.selectedId === id
          ? 'bg-omni-dark border-omni shadow-omni'
          : 'border-transparent hover:bg-surface-2 hover:border-[#3a4555]'"
        @click="store.selectPlayer(id); emit('select', id)"
      >
        <!-- active bar -->
        <div v-if="store.selectedId === id"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-omni rounded-r" />

        <!-- avatar -->
        <PlayerAvatar :player-id="id" :name="p.name" size="md"
          :class="store.selectedId === id ? 'border-omni' : ''" />

        <!-- info -->
        <div class="flex-1 min-w-0 pr-5">
          <div class="font-bold text-sm text-white leading-tight truncate">{{ p.name || id }}</div>
          <div class="text-xs text-slate-400 mt-0.5 font-medium">
            {{ p.hp != null && p.hp_max != null ? `HP ${p.hp}/${p.hp_max} · ` : '' }}Lv.{{ p.level ?? '?' }}
          </div>
          <div v-if="p.active_alien"
            class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-omni-dark text-omni border border-omni-dim/50">
            <span class="w-1 h-1 rounded-full bg-omni animate-dot" />
            {{ p.active_alien }}
          </div>
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
