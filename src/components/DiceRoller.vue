<script setup>
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import { store } from '../store/index.js'

const emit = defineEmits(['close'])

const canvasEl  = ref(null)
const result    = ref(null)
const lastDie   = ref(null)
const isRolling = ref(false)
const history   = ref([])

const rollingFor = computed(() => store.selectedId)

const DICE = {
  d4:  { sides: 4,  geo: () => new THREE.TetrahedronGeometry(1.3),       color: '#a855f7' },
  d6:  { sides: 6,  geo: () => new THREE.BoxGeometry(1.5,1.5,1.5),       color: '#3b82f6' },
  d8:  { sides: 8,  geo: () => new THREE.OctahedronGeometry(1.35),        color: '#00e676' },
  d10:   {sides: 10,geo: () => new THREE.CylinderGeometry(1, 1, 1, 10),    color: '#f59e0b'},
  d12: { sides: 12, geo: () => new THREE.DodecahedronGeometry(1.2),       color: '#ef4444' },
  d20: { sides: 20, geo: () => new THREE.IcosahedronGeometry(1.35),       color: '#00e676' },
}

// three.js
let renderer, scene, camera, raf
let mesh = null, edges = null, rollSpeed = 0
let currentColor = '#00e676'

const edgeMat = new THREE.LineBasicMaterial({ color: 0x00e676 })
const solidMat = new THREE.MeshPhongMaterial({
  color: 0x001a0d, emissive: 0x003d1a, emissiveIntensity: 0.6,
  transparent: true, opacity: 0.88, shininess: 80,
})

function buildDie(type) {
  if (mesh)  { scene.remove(mesh);  mesh.geometry.dispose() }
  if (edges) { scene.remove(edges); edges.geometry.dispose() }
  const c = parseInt(DICE[type].color.replace('#',''), 16)
  edgeMat.color.setHex(c)
  solidMat.emissive.setHex(c)
  solidMat.emissiveIntensity = 0.3
  const geo = DICE[type].geo()
  mesh  = new THREE.Mesh(geo, solidMat)
  edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat)
  scene.add(mesh); scene.add(edges)
  currentColor = DICE[type].color
}

function loop() {
  raf = requestAnimationFrame(loop)
  if (!mesh) return
  if (rollSpeed > 0) {
    rollSpeed *= 0.962
    mesh.rotation.x  += rollSpeed * 0.09
    mesh.rotation.y  += rollSpeed * 0.14
    mesh.rotation.z  += rollSpeed * 0.07
    if (rollSpeed < 0.005) rollSpeed = 0
  } else {
    mesh.rotation.y += 0.006
    mesh.rotation.x += 0.002
  }
  edges.rotation.copy(mesh.rotation)
  renderer.render(scene, camera)
}

function initThree() {
  const container = canvasEl.value.parentElement
  const W = container.clientWidth  || 380
  const H = container.clientHeight || 320
  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100)
  camera.position.set(0, 0, 5.5)
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  scene.add(new THREE.AmbientLight(0x112211, 1.2))
  const d1 = new THREE.DirectionalLight(0x00ff88, 1.5)
  d1.position.set(4,6,4); scene.add(d1)
  const p1 = new THREE.PointLight(0x00e676, 3, 12)
  p1.position.set(0,0,4); scene.add(p1)
  buildDie('d20')
  loop()
}

// ── roll ──────────────────────────────────────────────────────
function roll(type) {
  if (isRolling.value) return
  lastDie.value  = type
  result.value   = null
  isRolling.value = true
  rollSpeed = 11 + Math.random() * 7
  buildDie(type)

  const check = setInterval(() => {
    if (rollSpeed < 0.005) {
      clearInterval(check)
      const val = Math.floor(Math.random() * DICE[type].sides) + 1
      result.value    = val
      isRolling.value = false
      const entry = { die: type, value: val, color: DICE[type].color, ts: Date.now(), player: rollingFor.value }
      history.value.unshift(entry)
      if (history.value.length > 10) history.value.pop()
      if (rollingFor.value) store.broadcastDiceRoll(rollingFor.value, entry)
    }
  }, 50)
}

// ── result styling ────────────────────────────────────────────
function resultGlow(val, die) {
  if (!die) return '#ffffff'
  if (val === DICE[die].sides) return '#fde047'
  if (val === 1)               return '#f87171'
  return DICE[die].color
}

onMounted(() => nextTick(initThree))
onUnmounted(() => { cancelAnimationFrame(raf); renderer?.dispose() })
</script>

<template>
  <div class="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 flex items-end sm:items-stretch sm:block">

    <!-- backdrop (mobile only) -->
    <div class="absolute inset-0 bg-black/60 sm:hidden" @click="emit('close')" />

    <!-- panel -->
    <div class="relative w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl overflow-hidden border border-[#2a3340]"
         style="background:#080b0e; box-shadow:0 0 50px rgba(0,230,118,0.12),0 24px 64px rgba(0,0,0,0.7)">

      <!-- header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[#1e2a1e]"
           style="background:linear-gradient(135deg,#0a1a0a,#0f1a0f)">
        <div class="flex items-center gap-2">
          <span class="text-omni text-lg">⬡</span>
          <span class="font-cinzel font-bold text-sm tracking-[3px] uppercase text-white">Dice Roller</span>
        </div>
        <button class="text-slate-500 hover:text-white text-xl transition-colors leading-none"
                @click="emit('close')">✕</button>
      </div>

      <!-- current player indicator -->
      <div class="px-4 pt-2 pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <span v-if="rollingFor">
          Rolling for
          <span class="text-omni">{{ store.players[rollingFor]?.name || rollingFor }}</span>
        </span>
        <span v-else class="italic text-slate-600">เปิดหน้า player เพื่อทอยให้</span>
      </div>

      <!-- 3D canvas -->
      <div class="relative mx-3 mt-2 rounded-xl overflow-hidden"
           style="height:320px; background:radial-gradient(ellipse at center,#061206,#030805)">
        <div class="absolute inset-0 pointer-events-none"
             style="background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,230,118,0.015) 3px,rgba(0,230,118,0.015) 4px);z-index:2"/>
        <canvas ref="canvasEl" class="w-full h-full block" />

        <!-- result -->
        <Transition name="pop">
          <div v-if="result !== null && !isRolling"
               class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div class="font-cinzel font-black leading-none transition-all"
                 :class="result >= 10 ? 'text-[96px]' : 'text-[112px]'"
                 :style="`color:${resultGlow(result, lastDie)}; text-shadow:0 0 30px ${resultGlow(result, lastDie)}`">
              {{ result }}
            </div>
            <div class="text-xs font-bold tracking-[5px] uppercase mt-1"
                 :style="`color:${resultGlow(result, lastDie)}; opacity:0.6`">
              {{ lastDie }}
            </div>
          </div>
        </Transition>

        <!-- rolling label -->
        <div v-if="isRolling"
             class="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-10">
          <span class="text-xs font-bold tracking-[3px] uppercase text-omni/60 animate-pulse">rolling...</span>
        </div>

        <div class="absolute inset-0 pointer-events-none rounded-xl"
             style="box-shadow:inset 0 0 30px rgba(0,230,118,0.05);z-index:1"/>
      </div>

      <!-- die buttons — 2 rows × 3 -->
      <div class="grid grid-cols-3 gap-2.5 px-3 py-3">
        <button
          v-for="(cfg, d) in DICE" :key="d"
          class="relative py-5 rounded-xl font-cinzel font-black text-xl tracking-wider border transition-all active:scale-95"
          :class="lastDie === d && !isRolling
            ? 'border-2 scale-[1.03]'
            : 'border-[#2a3340] bg-[#0f1318] text-slate-300 hover:border-slate-500'"
          :style="lastDie === d && !isRolling
            ? `border-color:${cfg.color}; background:#0a1a0a; color:${cfg.color}; box-shadow:0 0 16px ${cfg.color}44`
            : ''"
          :disabled="isRolling"
          @click="roll(d)"
        >
          {{ d.toUpperCase() }}
          <!-- last result mini badge -->
          <span v-if="history.find(h=>h.die===d)"
            class="absolute top-1 right-1.5 text-[10px] font-bold opacity-60">
            {{ history.find(h=>h.die===d)?.value }}
          </span>
        </button>
      </div>

      <!-- history -->
      <div v-if="history.length" class="px-3 pb-3">
        <div class="text-[10px] font-bold uppercase tracking-[3px] text-slate-600 mb-1.5">History</div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(h, i) in history" :key="h.ts"
            class="px-2 py-0.5 rounded-md text-xs font-bold border transition-all"
            :style="i === 0
              ? `background:#0a140a; border-color:${h.color}66; color:${h.color}`
              : 'background:#0f1318; border-color:#2a3340; color:#64748b'"
          >
            <span v-if="h.player" class="opacity-70 mr-0.5">{{ store.players[h.player]?.name || h.player }}·</span>{{ h.die }}=<strong :style="i===0 ? `color:${h.color}` : ''">{{ h.value }}</strong>
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.pop-enter-active { animation: pop .35s cubic-bezier(.16,1,.3,1); }
.pop-leave-active { transition: opacity .15s ease; }
.pop-leave-to    { opacity: 0; }
@keyframes pop {
  from { transform: scale(.5); opacity: 0; }
  to   { transform: scale(1);  opacity: 1; }
}
</style>
