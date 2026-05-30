<script setup>
import { useToast } from '../../composables/useToast.js'
const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 flex flex-col gap-2 z-[999]">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold max-w-xs shadow-lg"
          :class="t.type === 'success'
            ? 'bg-omni-dark border border-omni-dim text-omni'
            : 'bg-red-900/30 border border-red-700 text-red-400'"
        >
          <span>{{ t.type === 'success' ? '✓' : '✕' }}</span>
          <span>{{ t.msg }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { transform: translateX(110%); opacity: 0; }
.toast-leave-to   { transform: translateX(110%); opacity: 0; }
</style>
