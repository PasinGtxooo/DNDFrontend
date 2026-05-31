<script setup>
import { ref } from 'vue'
import { store } from '../store/index.js'
import { useToast } from '../composables/useToast.js'
import AddPlayerModal from './modals/AddPlayerModal.vue'
import PlayerAvatar from './ui/PlayerAvatar.vue'
import AlienAvatar from './ui/AlienAvatar.vue'

const showAdd = ref(false)
const { toast } = useToast()
const emit = defineEmits(['select'])

async function removePlayer(e, id) {
  e.stopPropagation()
  if (!confirm(`Delete player "${store.players[id]?.name || id}"?`)) return
  try { await store.deletePlayer(id) }
  catch (err) { toast(err.message, 'error') }
}

function hpPct(p) {
  if (!p?.hp_max) return 0
  return Math.min(100, Math.round((p.hp / p.hp_max) * 100))
}
function hpColor(pct) {
  if (pct > 60) return '#00e676'
  if (pct > 30) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <aside class="flex flex-col bg-surface border-r border-[#2a3340] h-full">

    <!-- header -->
    <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#2a3340]">
      <span class="font-cinzel text-base font-bold tracking-[3px] uppercase text-slate-200">Players</span>
      <button class="btn-primary btn btn-sm" @click="showAdd = true">+ Add</button>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      <p v-if="!Object.keys(store.players).length"
         class="text-center text-slate-400 font-semibold text-sm py-10 px-4">
        No players yet.<br />Click <strong class="text-slate-200">+ Add</strong> to create one.
      </p>

      <div
        v-for="(p, id) in store.players"
        :key="id"
        class="group relative rounded-xl border cursor-pointer transition-all duration-150 overflow-hidden"
        :class="store.selectedId === id
          ? 'border-omni shadow-omni bg-omni-dark'
          : 'border-[#2a3340] hover:border-[#3a4555] hover:bg-surface-2'"
        style="background: #0b1014"
        @click="emit('select', id)"
      >
        <!-- selected accent bar -->
        <div v-if="store.selectedId === id"
          class="absolute left-0 inset-y-0 w-[3px] bg-omni rounded-r" />

        <!-- main row -->
        <div class="flex items-center gap-3.5 px-4 py-3.5 pl-5">
          <!-- avatar: แสดง alien ถ้า transform อยู่ -->
          <AlienAvatar
            v-if="p.active_alien"
            :alien-id="p.active_alien"
            :name="store.aliens[p.active_alien]?.name || p.active_alien"
            :rank="store.aliens[p.active_alien]?.rank"
            size="lg"
            :class="store.selectedId === id ? 'ring-2 ring-omni ring-offset-1 ring-offset-[#0b1014]' : ''"
          />
          <PlayerAvatar
            v-else
            :player-id="id" :name="p.name" size="lg"
            :class="store.selectedId === id ? 'ring-2 ring-omni ring-offset-1 ring-offset-[#0b1014]' : ''"
          />

          <!-- info -->
          <div class="flex-1 min-w-0 pr-6">
            <!-- name + level -->
            <div class="flex items-baseline gap-2 min-w-0">
              <div class="font-cinzel font-bold text-base text-white leading-tight truncate">
                {{ p.name || id }}
              </div>
              <span class="text-[11px] font-bold text-slate-500 flex-shrink-0">Lv.{{ p.level ?? '?' }}</span>
            </div>

            <!-- HP bar -->
            <div v-if="p.hp != null && p.hp_max" class="mt-2">
              <div class="flex justify-between text-[11px] font-semibold mb-1"
                   :style="`color:${hpColor(hpPct(p))}`">
                <span>HP</span>
                <span>{{ p.hp }} / {{ p.hp_max }}</span>
              </div>
              <div class="h-1.5 bg-[#0a0f0a] rounded-full overflow-hidden border border-[#1e2a1e]">
                <div class="h-full rounded-full transition-all duration-500"
                  :style="`width:${hpPct(p)}%; background:${hpColor(hpPct(p))}; box-shadow:0 0 6px ${hpColor(hpPct(p))}88`" />
              </div>
            </div>

            <!-- XP + slots -->
            <div class="flex gap-3 mt-1.5 text-[11px] text-slate-500 font-medium">
              <span>XP {{ p.xp ?? 0 }}</span>
              <span v-if="p.omnitrix_slots">⬡ {{ p.omnitrix_slots }} slots</span>
            </div>

            <!-- badges row -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <div v-if="p.active_alien"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-omni-dark text-omni border border-omni-dim/50">
                <span class="w-1.5 h-1.5 rounded-full bg-omni animate-dot" />
                {{ store.aliens[p.active_alien]?.name || p.active_alien }}
              </div>
              <!-- dice result -->
              <div v-if="store.diceResults[id]"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border"
                :style="`background:#0a0f0a; border-color:${store.diceResults[id].color}55; color:${store.diceResults[id].color}`">
                🎲 {{ store.diceResults[id].die }} = <strong class="text-sm">{{ store.diceResults[id].value }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- delete btn -->
        <button
          class="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-sm w-6 h-6 flex items-center justify-center rounded"
          @click="removePlayer($event, id)"
          title="Delete player"
        >✕</button>
      </div>
    </div>
  </aside>

  <AddPlayerModal v-if="showAdd" @close="showAdd = false" />
</template>
