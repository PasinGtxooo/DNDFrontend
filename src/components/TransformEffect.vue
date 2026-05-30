<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({ alienName: String })
const emit  = defineEmits(['done'])

const phase = ref(1) // 1=spin 2=flash 3=reveal 4=fadeout

onMounted(() => {
  setTimeout(() => phase.value = 2, 700)
  setTimeout(() => phase.value = 3, 1100)
  setTimeout(() => phase.value = 4, 2000)
  setTimeout(() => emit('done'),     2600)
})
</script>

<template>
  <Teleport to="body">
    <div class="transform-overlay" :class="`phase-${phase}`">

      <!-- flash layer -->
      <div class="flash-layer" />

      <!-- omnitrix ring -->
      <div class="omni-ring-outer">
        <div class="omni-ring-inner">
          <div class="omni-core">⬡</div>
        </div>
      </div>

      <!-- scan lines -->
      <div class="scan-lines" />

      <!-- alien name -->
      <div class="alien-name-wrap" :class="{ show: phase >= 3 }">
        <div class="alien-name-sub">OMNITRIX TRANSFORM</div>
        <div class="alien-name-text">{{ alienName }}</div>
        <div class="alien-name-bar" />
      </div>

    </div>
  </Teleport>
</template>

<style scoped>
.transform-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  animation: overlay-in 0.15s ease forwards;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── FLASH ── */
.flash-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #00e676 0%, #003d1a 50%, transparent 80%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.phase-2 .flash-layer { opacity: 0.15; }
.phase-3 .flash-layer { opacity: 0.9; transition: opacity 0.15s ease; }
.phase-4 .flash-layer { opacity: 0; transition: opacity 0.5s ease; }

/* ── OMNITRIX RING ── */
.omni-ring-outer {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 3px solid rgba(0, 230, 118, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: ring-spin 1.2s linear infinite, ring-in 0.4s ease forwards;
  box-shadow: 0 0 40px rgba(0,230,118,0.2), 0 0 80px rgba(0,230,118,0.1);
}
.omni-ring-outer::before, .omni-ring-outer::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(0,230,118,0.2);
}
.omni-ring-outer::before { inset: 12px; animation: ring-spin 0.8s linear infinite reverse; }
.omni-ring-outer::after  { inset: 24px; animation: ring-spin 2s linear infinite; }

.omni-ring-inner {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 2px solid #00e676;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px #00e676, inset 0 0 30px rgba(0,230,118,0.3);
  animation: ring-spin 0.6s linear infinite reverse, pulse-glow 0.6s ease-in-out infinite alternate;
}

.omni-core {
  font-size: 56px;
  color: #00e676;
  text-shadow: 0 0 20px #00e676, 0 0 40px #00e676;
  line-height: 1;
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}
@keyframes ring-in {
  from { transform: scale(0.3) rotate(-180deg); opacity: 0; }
  to   { transform: scale(1) rotate(0deg);      opacity: 1; }
}
@keyframes pulse-glow {
  from { box-shadow: 0 0 20px #00e676, inset 0 0 20px rgba(0,230,118,0.2); }
  to   { box-shadow: 0 0 50px #00e676, inset 0 0 40px rgba(0,230,118,0.5); }
}

/* hide rings after flash */
.phase-3 .omni-ring-outer,
.phase-4 .omni-ring-outer {
  animation: ring-explode 0.3s ease forwards;
}
@keyframes ring-explode {
  to { transform: scale(3); opacity: 0; }
}

/* ── SCAN LINES ── */
.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,230,118,0.03) 2px,
    rgba(0,230,118,0.03) 4px
  );
  pointer-events: none;
}

/* ── ALIEN NAME ── */
.alien-name-wrap {
  position: absolute;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease;
  pointer-events: none;
}
.alien-name-wrap.show {
  opacity: 1;
  transform: translateY(0);
}
.alien-name-sub {
  font-family: 'Rajdhani', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: rgba(0,230,118,0.7);
  margin-bottom: 8px;
}
.alien-name-text {
  font-family: 'Cinzel', serif;
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 30px #00e676, 0 0 60px rgba(0,230,118,0.5);
  letter-spacing: 4px;
  text-transform: uppercase;
  animation: text-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.alien-name-bar {
  width: 0%;
  height: 2px;
  background: linear-gradient(to right, transparent, #00e676, transparent);
  margin: 12px auto 0;
  animation: bar-expand 0.6s 0.2s ease forwards;
}

@keyframes text-in {
  from { letter-spacing: 20px; opacity: 0; }
  to   { letter-spacing: 4px;  opacity: 1; }
}
@keyframes bar-expand {
  from { width: 0%; }
  to   { width: 80%; }
}

/* ── PHASE 4: FADE OUT ── */
.phase-4 {
  animation: overlay-out 0.6s ease forwards;
}
@keyframes overlay-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>
