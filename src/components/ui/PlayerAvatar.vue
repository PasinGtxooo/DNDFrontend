<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  playerId: String,
  name:     String,
  size:     { type: String, default: 'md' }, // sm | md | lg | xl
})

const imgError      = ref(false)
const fallbackError = ref(false)

// reset errors when playerId changes
watch(() => props.playerId, () => { imgError.value = false; fallbackError.value = false })

const imgSrc      = computed(() => `/Img/${props.playerId}.webp`)
const fallbackSrc = '/Img/player.webp'

function onError() {
  if (!imgError.value) { imgError.value = true; return }
  fallbackError.value = true
}

const initials = computed(() => {
  const n = props.name || props.playerId || '?'
  const words = n.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return n.slice(0, 2).toUpperCase()
})

const sizeClass = computed(() => ({
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-2xl',
}[props.size] ?? 'w-10 h-10 text-sm'))
</script>

<template>
  <div
    class="rounded-xl overflow-hidden flex-shrink-0 border-2 border-[#3a4555]"
    :class="sizeClass"
  >
    <!-- real image (player-specific) -->
    <img
      v-if="!imgError"
      :src="imgSrc"
      :alt="name || playerId"
      class="w-full h-full object-cover"
      @error="onError"
    />
    <!-- generic fallback image -->
    <img
      v-else-if="!fallbackError"
      :src="fallbackSrc"
      :alt="name || playerId"
      class="w-full h-full object-cover"
      @error="onError"
    />
    <!-- initials placeholder -->
    <div v-else
      class="w-full h-full flex items-center justify-center font-cinzel font-black text-omni"
      style="background: radial-gradient(circle at 40% 35%, #003d1a, #001a0d)"
    >{{ initials }}</div>
  </div>
</template>
