<script setup>
defineProps({ title: String })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="bg-surface border border-border rounded-xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button
          class="absolute top-4 right-4 text-[#8a9ab0] hover:text-[#e8edf5] text-xl leading-none transition-colors"
          @click="emit('close')"
        >✕</button>
        <div class="font-cinzel text-xl font-bold text-omni mb-5">{{ title }}</div>
        <slot />
        <div class="flex justify-end gap-2 mt-5">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
