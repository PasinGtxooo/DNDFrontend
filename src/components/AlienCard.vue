<script setup>
import AlienAvatar from './ui/AlienAvatar.vue'

const props = defineProps({
  alienId:         String,
  alien:           Object,
  isActive:        Boolean,
  showMasterBadge: { type: Boolean, default: false },
})
const emit = defineEmits(['edit'])

const pct = () => props.alien?.hp_max
  ? Math.round((props.alien.hp / props.alien.hp_max) * 100)
  : 0

const rankStyle = {
  SSS: 'bg-purple-900/50 text-purple-200 border-purple-500/60',
  S:   'bg-red-900/50    text-red-200    border-red-500/60',
  A:   'bg-yellow-900/50 text-yellow-200 border-yellow-500/60',
  B:   'bg-blue-900/50   text-blue-200   border-blue-500/60',
  C:   'bg-slate-700/60  text-slate-200  border-slate-500/50',
  D:   'bg-slate-800/60  text-slate-300  border-slate-600/50',
}
</script>

<template>
  <div
    class="border rounded-xl p-4 cursor-pointer transition-all duration-150"
    :class="isActive
      ? 'border-omni bg-omni-dark shadow-omni-lg'
      : 'bg-surface-2 border-[#2a3340] hover:border-omni hover:shadow-omni'"
    @click="emit('edit', alienId)"
  >
    <!-- badges -->
    <div class="flex gap-1.5 mb-2 flex-wrap">
      <div v-if="isActive"
        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-omni-dark text-omni border border-omni-dim/50">
        <span class="w-1.5 h-1.5 rounded-full bg-omni animate-dot" />ACTIVE
      </div>
      <div v-if="showMasterBadge"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-200 border border-blue-600/50">
        ⬡ TEMPLATE
      </div>
    </div>

    <!-- avatar + name -->
    <div class="flex items-center gap-3 mb-3">
      <AlienAvatar :alien-id="alienId" :name="alien?.name" :rank="alien?.rank" size="md" />
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-1">
          <div class="font-cinzel font-bold text-base text-white leading-snug truncate">
            {{ alien?.name || alienId }}
          </div>
          <span v-if="alien?.rank"
            class="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-black border tracking-wider"
            :class="rankStyle[alien.rank] ?? rankStyle.D"
          >{{ alien.rank }}</span>
        </div>
        <div class="text-sm text-slate-400 font-medium mt-0.5 truncate">{{ alienId }}</div>
      </div>
    </div>

    <!-- HP bar -->
    <div v-if="alien?.hp != null && alien?.hp_max" class="mb-3">
      <div class="flex justify-between text-sm font-semibold text-slate-300 mb-1">
        <span>HP</span><span>{{ alien.hp }} / {{ alien.hp_max }}</span>
      </div>
      <div class="h-2 bg-surface-3 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-omni-dim to-omni rounded-full transition-all duration-500"
          :style="{ width: pct() + '%' }" />
      </div>
    </div>

    <!-- mini stats 2×3 -->
    <div class="grid grid-cols-3 gap-1.5 mb-3">
      <div
        v-for="[lbl, val] in [['AC',alien?.ac],['SPD',alien?.speed],['STR',alien?.STR],['DEX',alien?.DEX],['CON',alien?.CON],['INT',alien?.INT]]"
        :key="lbl"
        class="bg-[#0f1318] border border-[#2a3340] rounded-lg text-center py-1.5 px-1"
      >
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wide">{{ lbl }}</div>
        <div class="text-sm font-bold text-white mt-0.5">{{ val ?? '—' }}</div>
      </div>
    </div>

    <!-- ability tags -->
    <div v-if="alien?.abilities?.length" class="flex flex-wrap gap-1">
      <span v-for="ab in alien.abilities.slice(0,3)" :key="ab"
        class="px-2 py-0.5 rounded-full text-xs font-semibold bg-omni-dark text-omni border border-omni-dim/40">
        {{ ab }}
      </span>
      <span v-if="alien.abilities.length > 3"
        class="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1e2530] text-slate-300 border border-[#3a4555]">
        +{{ alien.abilities.length - 3 }}
      </span>
    </div>
  </div>
</template>
