<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  alienId:  String,
  name:     String,
  rank:     String,
  size:     { type: String, default: 'md' }, // sm | md | lg | xl
})

const imgError = ref(false)
const imgSrc   = computed(() => `/aliens/${props.alienId}.webp`)

function onError() { imgError.value = true }

// initials from name e.g. "Four Arms" → "FA", "XLR8" → "XL"
const initials = computed(() => {
  const n = props.name || props.alienId || '?'
  const words = n.trim().split(/[\s_-]+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return n.slice(0, 2).toUpperCase()
})

const rankColors = {
  SSS: { bg: 'from-purple-900 to-purple-700', border: '#a855f7', text: '#e9d5ff', glow: 'rgba(168,85,247,0.4)' },
  S:   { bg: 'from-red-900    to-red-700',    border: '#ef4444', text: '#fecaca', glow: 'rgba(239,68,68,0.4)' },
  A:   { bg: 'from-yellow-900 to-yellow-700', border: '#eab308', text: '#fef08a', glow: 'rgba(234,179,8,0.4)' },
  B:   { bg: 'from-blue-900   to-blue-700',   border: '#3b82f6', text: '#bfdbfe', glow: 'rgba(59,130,246,0.4)' },
  C:   { bg: 'from-slate-800  to-slate-600',  border: '#64748b', text: '#cbd5e1', glow: 'rgba(100,116,139,0.3)' },
  D:   { bg: 'from-slate-900  to-slate-700',  border: '#475569', text: '#94a3b8', glow: 'rgba(71,85,105,0.3)' },
}
const defaultColor = { bg: 'from-slate-800 to-slate-600', border: '#3a4555', text: '#94a3b8', glow: 'none' }
const color = computed(() => rankColors[props.rank] ?? defaultColor)

const sizeClass = computed(() => ({
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-24 h-24 text-2xl',
  xl: 'w-32 h-32 text-3xl',
}[props.size] ?? 'w-16 h-16 text-lg'))
</script>

<template>
  <div
    class="relative flex-shrink-0 rounded-xl overflow-hidden"
    :class="sizeClass"
    :style="`border: 2px solid ${color.border}; box-shadow: 0 0 12px ${color.glow};`"
  >
    <!-- real image -->
    <img
      v-if="!imgError"
      :src="imgSrc"
      :alt="name || alienId"
      class="w-full h-full object-cover"
      @error="onError"
    />

    <!-- placeholder -->
    <div
      v-else
      class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br"
      :class="color.bg"
    >
      <span
        class="font-cinzel font-black leading-none select-none"
        :style="`color: ${color.text}; text-shadow: 0 0 12px ${color.glow};`"
      >{{ initials }}</span>
      <span
        v-if="rank"
        class="text-[9px] font-black tracking-widest mt-0.5 opacity-60"
        :style="`color: ${color.text};`"
      >{{ rank }}</span>
    </div>
  </div>
</template>
