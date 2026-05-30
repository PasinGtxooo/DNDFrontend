<script setup>
defineProps({ label: String, value: [String, Number] })
</script>

<template>
  <div class="bg-[#0f1318] border border-[#2a3340] rounded-lg p-3 text-center hover:border-omni transition-colors">
    <div class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{{ label }}</div>
    <div class="text-xl font-bold" :class="value != null ? 'text-omni' : 'text-slate-600'">
      {{ value ?? '—' }}
    </div>
  </div>
</template>
