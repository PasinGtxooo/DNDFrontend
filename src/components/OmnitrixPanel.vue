<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/index.js'
import { useToast } from '../composables/useToast.js'
import TransformEffect from './TransformEffect.vue'
import AlienAvatar from './ui/AlienAvatar.vue'

const { toast } = useToast()
const selected       = ref('')
const transformingTo = ref(null)

const alienIds = computed(() => Object.keys(store.aliens))
const p        = computed(() => store.player)

const activeAlien = computed(() =>
  p.value?.active_alien ? store.aliens[p.value.active_alien] : null
)

function playSound(src) {
  try {
    const audio = new Audio(src)
    audio.volume = 0.8
    audio.play().catch(() => {})
  } catch {}
}

async function doTransform() {
  if (!selected.value) return toast('Select an alien first', 'error')
  playSound('/MP3/Transform.mp3')
  const name = store.aliens[selected.value]?.name || selected.value
  transformingTo.value = name
}

function onEffectDone() {
  store.doTransform(selected.value)
  transformingTo.value = null
}

async function doRevert() {
  playSound('/MP3/out.mp3')
  await store.doTransform(null)
  selected.value = ''
}
</script>

<template>
  <div class="bg-surface border border-omni-dim/60 rounded-xl p-5 shadow-omni-lg mb-4">
    <div class="card-title">⬡ Omnitrix</div>

    <div class="flex items-center gap-4 mb-4">
      <!-- avatar or idle orb -->
      <template v-if="p?.active_alien && activeAlien">
        <AlienAvatar
          :alien-id="p.active_alien"
          :name="activeAlien?.name"
          :rank="activeAlien?.rank"
          size="lg"
          class="ring-2 ring-omni shadow-omni-lg"
        />
      </template>
      <div v-else
        class="w-24 h-24 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 border-2 border-[#3a4555]"
        style="background: radial-gradient(circle at 40% 35%, #1e2530, #111418)">
        ⬡
      </div>

      <div>
        <h3 class="font-cinzel font-bold text-lg leading-tight"
            :class="p?.active_alien ? 'text-omni' : 'text-slate-300'">
          {{ activeAlien?.name || (p?.active_alien ? p.active_alien : 'Not Transformed') }}
        </h3>
        <p v-if="p?.active_alien" class="text-sm text-slate-400 font-medium mt-0.5">
          {{ p.active_alien }}
        </p>
        <div class="mt-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            :class="p?.omnitrix_cooldown
              ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-600/40'
              : 'bg-omni-dark text-omni border border-omni-dim/40'">
            {{ p?.omnitrix_cooldown ? '⏱ COOLDOWN' : '✓ READY' }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex gap-2 flex-wrap">
      <select v-model="selected" class="input flex-1 min-w-[160px]">
        <option value="">-- Select Alien --</option>
        <option v-for="id in alienIds" :key="id" :value="id">
          {{ store.aliens[id]?.name || id }}
        </option>
      </select>
      <button class="btn-primary btn btn-sm" @click="doTransform">⬡ Transform</button>
      <button class="btn-outline btn btn-sm" @click="doRevert">Revert</button>
    </div>
  </div>

  <TransformEffect
    v-if="transformingTo"
    :alien-name="transformingTo"
    @done="onEffectDone"
  />
</template>
