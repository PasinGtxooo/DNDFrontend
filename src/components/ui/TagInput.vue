<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const draft = ref('')

function commitDraft() {
  const parts = draft.value.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length) emit('update:modelValue', [...props.modelValue, ...parts])
  draft.value = ''
}

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commitDraft()
  } else if (e.key === 'Backspace' && !draft.value && props.modelValue.length) {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  }
}

function removeAt(i) {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}
</script>

<template>
  <div class="input flex flex-wrap items-center gap-1.5 h-auto min-h-[2.5rem] py-1.5">
    <span v-for="(tag, i) in modelValue" :key="i"
      class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-semibold bg-omni-dark text-omni border border-omni-dim/40">
      {{ tag }}
      <button type="button" class="text-omni/70 hover:text-white leading-none" @click="removeAt(i)">✕</button>
    </span>
    <input
      v-model="draft"
      :placeholder="modelValue.length ? '' : placeholder"
      class="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
      @keydown="onKeydown"
      @blur="commitDraft"
    />
  </div>
</template>
