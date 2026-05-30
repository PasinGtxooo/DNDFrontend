<script setup>
import { ref } from 'vue'

const props = defineProps({
  alienId:         String,
  alien:           Object,
  isActive:        Boolean,
  isEmptySlot:     { type: Boolean, default: false },
  showMasterBadge: { type: Boolean, default: false },
})
const emit = defineEmits(['edit'])

const imgError = ref(false)

const pct = () => props.alien?.hp_max
  ? Math.round((props.alien.hp / props.alien.hp_max) * 100)
  : 0

const rankStyle = {
  SSS: 'bg-purple-900/60 text-purple-200 border-purple-500/60',
  S:   'bg-red-900/60    text-red-200    border-red-500/60',
  A:   'bg-yellow-900/60 text-yellow-200 border-yellow-500/60',
  B:   'bg-blue-900/60   text-blue-200   border-blue-500/60',
  C:   'bg-slate-700/60  text-slate-200  border-slate-500/50',
  D:   'bg-slate-800/60  text-slate-300  border-slate-600/50',
}

const rankGlow = {
  SSS: 'rgba(168,85,247,0.4)',
  S:   'rgba(239,68,68,0.4)',
  A:   'rgba(234,179,8,0.4)',
  B:   'rgba(59,130,246,0.4)',
  C:   'rgba(100,116,139,0.2)',
  D:   'rgba(71,85,105,0.2)',
}

const initials = (name, id) => {
  const n = name || id || '?'
  const w = n.trim().split(/[\s_-]+/)
  return w.length >= 2 ? (w[0][0]+w[1][0]).toUpperCase() : n.slice(0,2).toUpperCase()
}
</script>

<template>
  <!-- Empty slot card -->
  <div
    v-if="isEmptySlot"
    class="border border-dashed border-[#2a3340] rounded-xl flex flex-col items-center justify-center gap-2 text-[#3a4555] select-none"
    style="height:280px; background:#090d11"
  >
    <span class="text-3xl opacity-40">⬡</span>
    <span class="text-xs font-semibold tracking-widest uppercase opacity-40">Empty Slot</span>
  </div>

  <!-- Normal alien card -->
  <div
    v-else
    class="border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col"
    :class="isActive
      ? 'border-omni shadow-omni-lg'
      : 'border-[#2a3340] hover:border-omni hover:shadow-omni'"
    :style="isActive ? 'background:#051205' : 'background:#0e1318'"
    @click="emit('edit', alienId)"
  >
    <!-- ── IMAGE BANNER ── -->
    <div class="relative overflow-hidden" style="height:160px">

      <!-- image -->
      <img
        v-if="!imgError"
        :src="`/aliens/${alienId}.webp`"
        :alt="alien?.name || alienId"
        class="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        @error="imgError = true"
      />

      <!-- placeholder when no image -->
      <div v-else
        class="w-full h-full flex items-center justify-center font-cinzel font-black text-4xl"
        :style="`background: radial-gradient(circle at 40% 35%, #003d1a, #001a0d); color: #00e676`"
      >{{ initials(alien?.name, alienId) }}</div>

      <!-- gradient overlay bottom -->
      <div class="absolute inset-x-0 bottom-0 h-20"
           style="background: linear-gradient(to top, #0e1318 0%, transparent 100%)" />
      <div v-if="isActive" class="absolute inset-x-0 bottom-0 h-20"
           style="background: linear-gradient(to top, #051205 0%, transparent 100%)" />

      <!-- badges top-left -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <div v-if="isActive"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-omni-dark/90 text-omni border border-omni-dim/60 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-omni animate-dot" />ACTIVE
        </div>
        <div v-if="showMasterBadge"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950/90 text-blue-200 border border-blue-600/50 backdrop-blur-sm">
          ⬡ TEMPLATE
        </div>
      </div>

      <!-- rank badge top-right -->
      <span v-if="alien?.rank"
        class="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-black border tracking-wider backdrop-blur-sm"
        :class="rankStyle[alien.rank] ?? rankStyle.D"
      >{{ alien.rank }}</span>

      <!-- name overlay on image bottom -->
      <div class="absolute bottom-0 inset-x-0 px-3 pb-2">
        <div class="font-cinzel font-bold text-base text-white leading-tight drop-shadow-lg">
          {{ alien?.name || alienId }}
        </div>
        <div class="text-xs text-slate-400 font-medium mt-0.5">{{ alienId }}</div>
      </div>
    </div>

    <!-- ── BODY ── -->
    <div class="px-3 pt-2 pb-3 flex flex-col gap-2">

      <!-- HP bar -->
      <div v-if="alien?.hp != null && alien?.hp_max">
        <div class="flex justify-between text-xs font-semibold text-slate-400 mb-1">
          <span>HP</span><span>{{ alien.hp }} / {{ alien.hp_max }}</span>
        </div>
        <div class="h-1.5 bg-[#0a0f0a] rounded-full overflow-hidden border border-[#1e2a1e]">
          <div class="h-full bg-gradient-to-r from-omni-dim to-omni rounded-full transition-all duration-500"
            :style="{ width: pct() + '%' }" />
        </div>
      </div>

      <!-- mini stats -->
      <div class="grid grid-cols-3 gap-1">
        <div
          v-for="[lbl, val] in [['AC',alien?.ac],['SPD',alien?.speed],['STR',alien?.STR],['DEX',alien?.DEX],['CON',alien?.CON],['INT',alien?.INT]]"
          :key="lbl"
          class="bg-[#0a0f0a] border border-[#1e2a1e] rounded-md text-center py-1"
        >
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{{ lbl }}</div>
          <div class="text-sm font-bold text-white">{{ val ?? '—' }}</div>
        </div>
      </div>

      <!-- ability tags -->
      <div v-if="alien?.abilities?.length" class="flex flex-wrap gap-1">
        <span v-for="ab in alien.abilities.slice(0,3)" :key="ab"
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-omni-dark text-omni border border-omni-dim/40">
          {{ ab }}
        </span>
        <span v-if="alien.abilities.length > 3"
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1e2530] text-slate-300 border border-[#3a4555]">
          +{{ alien.abilities.length - 3 }}
        </span>
      </div>

    </div>
  </div>
</template>
