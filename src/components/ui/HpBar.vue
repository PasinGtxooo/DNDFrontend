<script setup>
const props = defineProps({ hp: Number, hpMax: Number })
const pct = () => props.hpMax ? Math.round((props.hp / props.hpMax) * 100) : 0
const colorClass = () => {
  const p = pct()
  if (p < 25) return 'from-red-700 to-red-400'
  if (p < 50) return 'from-yellow-700 to-yellow-400'
  return 'from-omni-dim to-omni'
}
</script>

<template>
  <div>
    <div class="flex justify-between text-xs text-[#8a9ab0] mb-1.5">
      <span>HP</span>
      <span>{{ hp }} / {{ hpMax }} ({{ pct() }}%)</span>
    </div>
    <div class="h-2 bg-surface-3 rounded-full border border-border overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r shadow-omni transition-all duration-500"
        :class="colorClass()"
        :style="{ width: pct() + '%' }"
      />
    </div>
  </div>
</template>
