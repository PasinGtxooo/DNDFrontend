<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const emit = defineEmits(['close'])

// ── queue & results ────────────────────────────────────────────
const queue   = ref({})   // { d6: 2, d20: 1, ... }
const results = ref([])   // [{ die, value }]
const current = ref(null) // die being rolled right now
const isRolling = ref(false)
const history = ref([])

const DICE = {
  d4:  { sides: 4,  geo: () => new THREE.TetrahedronGeometry(1.3) },
  d6:  { sides: 6,  geo: () => new THREE.BoxGeometry(1.5, 1.5, 1.5) },
  d8:  { sides: 8,  geo: () => new THREE.OctahedronGeometry(1.35) },
  d10: { sides: 10, geo: () => new THREE.ConeGeometry(0.9, 1.6, 5) },
  d12: { sides: 12, geo: () => new THREE.DodecahedronGeometry(1.2) },
  d20: { sides: 20, geo: () => new THREE.IcosahedronGeometry(1.35) },
}

const queueList = computed(() =>
  Object.entries(queue.value).filter(([, n]) => n > 0)
)
const totalCount = computed(() =>
  Object.values(queue.value).reduce((a, b) => a + b, 0)
)
const total = computed(() =>
  results.value.reduce((s, r) => s + r.value, 0)
)
const hasCrit = computed(() =>
  results.value.some(r => r.value === DICE[r.die]?.sides)
)
const hasFail = computed(() =>
  results.value.some(r => r.value === 1)
)

function add(d) {
  queue.value[d] = (queue.value[d] || 0) + 1
}
function sub(d) {
  if ((queue.value[d] || 0) > 0) queue.value[d]--
}
function clearQueue() {
  queue.value = {}
  results.value = []
  current.value = null
}

// ── three.js ───────────────────────────────────────────────────
const canvasEl = ref(null)
let renderer, scene, camera, raf
let mesh = null, edges = null, rollSpeed = 0

const solidMat = new THREE.MeshPhongMaterial({
  color: 0x001a0d, emissive: 0x003d1a, emissiveIntensity: 0.6,
  transparent: true, opacity: 0.88, shininess: 80,
})
const edgeMat = new THREE.LineBasicMaterial({ color: 0x00e676 })

function buildDie(type) {
  if (mesh)  { scene.remove(mesh);  mesh.geometry.dispose() }
  if (edges) { scene.remove(edges); edges.geometry.dispose() }
  const geo = DICE[type].geo()
  mesh  = new THREE.Mesh(geo, solidMat)
  edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat)
  scene.add(mesh)
  scene.add(edges)
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
  const W = canvasEl.value.offsetWidth || 300
  const H = canvasEl.value.offsetHeight || 220
  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
  camera.position.set(0, 0, 5.5)
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  scene.add(new THREE.AmbientLight(0x112211, 1.2))
  const d1 = new THREE.DirectionalLight(0x00ff88, 1.5)
  d1.position.set(4, 6, 4); scene.add(d1)
  const p1 = new THREE.PointLight(0x00e676, 3, 12)
  p1.position.set(0, 0, 4); scene.add(p1)
  buildDie('d20')
  loop()
}

// ── roll engine ────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function rollOneDie(type) {
  return new Promise(resolve => {
    current.value   = type
    isRolling.value = true
    rollSpeed = 10 + Math.random() * 6
    buildDie(type)

    // wait until natural deceleration finishes (~1.2s)
    const check = setInterval(() => {
      if (rollSpeed < 0.005) {
        clearInterval(check)
        isRolling.value = false
        const val = Math.floor(Math.random() * DICE[type].sides) + 1
        resolve(val)
      }
    }, 50)
  })
}

async function rollAll() {
  if (isRolling.value || totalCount.value === 0) return
  results.value = []

  // expand queue to ordered array  e.g. {d6:2, d20:1} → ['d6','d6','d20']
  const flat = []
  for (const [die, n] of Object.entries(queue.value)) {
    for (let i = 0; i < n; i++) flat.push(die)
  }

  for (const die of flat) {
    const val = await rollOneDie(die)
    results.value.push({ die, value: val })
    await sleep(180)
  }

  current.value = null
  // save to history
  history.value.unshift({
    label: flat.map(d => d).join('+'),
    total: results.value.reduce((s, r) => s + r.value, 0),
    detail: results.value.map(r => `${r.die}=${r.value}`).join(' '),
    ts: Date.now(),
  })
  if (history.value.length > 6) history.value.pop()
}

// ── result helpers ────────────────────────────────────────────
function valClass(r) {
  if (r.value === DICE[r.die]?.sides) return 'text-yellow-300 font-black'
  if (r.value === 1)                  return 'text-red-400 font-black'
  if (r.value >= DICE[r.die]?.sides * 0.8) return 'text-omni font-bold'
  return 'text-white font-bold'
}

onMounted(initThree)
onUnmounted(() => { cancelAnimationFrame(raf); renderer?.dispose() })
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 w-[340px] select-none">
    <div class="rounded-2xl overflow-hidden border border-[#2a3340]"
         style="background:#080b0e; box-shadow: 0 0 50px rgba(0,230,118,0.12), 0 24px 64px rgba(0,0,0,0.7)">

      <!-- header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[#1e2a1e]"
           style="background: linear-gradient(135deg,#0a1a0a,#0f1a0f)">
        <div class="flex items-center gap-2">
          <span class="text-omni">⬡</span>
          <span class="font-cinzel font-bold text-sm tracking-[3px] uppercase text-white">Dice Roller</span>
          <span v-if="totalCount > 0"
            class="ml-1 px-2 py-0.5 rounded-full text-xs font-black bg-omni-dark text-omni border border-omni/30">
            {{ totalCount }}
          </span>
        </div>
        <button class="text-slate-500 hover:text-white text-lg transition-colors" @click="emit('close')">✕</button>
      </div>

      <!-- die buttons (+/-) -->
      <div class="px-3 pt-3 pb-2">
        <div class="grid grid-cols-6 gap-1.5">
          <div v-for="d in Object.keys(DICE)" :key="d" class="flex flex-col items-center gap-0.5">
            <!-- label + count badge -->
            <div class="relative w-full">
              <div class="text-center py-2 rounded-lg text-xs font-black tracking-wide border transition-all cursor-default"
                   :class="(queue[d]||0) > 0
                     ? 'bg-omni-dark border-omni text-omni'
                     : 'bg-[#111418] border-[#2a3340] text-slate-400'">
                {{ d }}
              </div>
              <span v-if="(queue[d]||0) > 0"
                class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black
                       bg-omni text-[#001a0d] flex items-center justify-center leading-none">
                {{ queue[d] }}
              </span>
            </div>
            <!-- +/- -->
            <div class="flex gap-0.5 w-full">
              <button class="flex-1 py-0.5 rounded text-xs font-black text-red-400 hover:bg-red-900/20 border border-[#2a3340] hover:border-red-700 transition-all"
                      @click="sub(d)">−</button>
              <button class="flex-1 py-0.5 rounded text-xs font-black text-omni hover:bg-omni-dark border border-[#2a3340] hover:border-omni transition-all"
                      @click="add(d)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- queue summary -->
      <div v-if="queueList.length" class="px-3 pb-2">
        <div class="flex flex-wrap gap-1 px-2 py-1.5 rounded-lg bg-[#0a0f0a] border border-[#1e2a1e]">
          <template v-for="([die, n], i) in queueList" :key="die">
            <span class="text-sm font-bold text-slate-200">{{ n > 1 ? `${n}×` : '' }}{{ die }}</span>
            <span v-if="i < queueList.length - 1" class="text-slate-600 text-sm">+</span>
          </template>
        </div>
      </div>

      <!-- canvas -->
      <div class="relative mx-3 rounded-xl overflow-hidden"
           style="height:190px; background: radial-gradient(ellipse at center,#061206,#030805)">
        <div class="absolute inset-0 pointer-events-none"
             style="background: repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,230,118,0.015) 3px,rgba(0,230,118,0.015) 4px); z-index:2" />
        <canvas ref="canvasEl" class="w-full h-full block" />

        <!-- current die label (while rolling multi) -->
        <div v-if="current && isRolling && totalCount > 1"
             class="absolute top-2 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <span class="px-2 py-0.5 rounded-full text-xs font-black bg-omni-dark text-omni border border-omni/40 tracking-widest uppercase">
            {{ current }}
          </span>
        </div>

        <!-- result overlay -->
        <Transition name="pop">
          <div v-if="results.length > 0 && !isRolling"
               class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <!-- single result: big number -->
            <template v-if="results.length === 1">
              <div class="font-cinzel font-black leading-none"
                   :class="[valClass(results[0]),
                            results[0].value >= 10 ? 'text-7xl' : 'text-8xl']"
                   style="text-shadow: 0 0 30px currentColor">
                {{ results[0].value }}
              </div>
              <div class="text-xs font-bold tracking-[4px] uppercase text-slate-500 mt-1">{{ results[0].die }}</div>
            </template>

            <!-- multi result: chips row + total -->
            <template v-else>
              <div class="flex flex-wrap justify-center gap-1.5 px-3 mb-2">
                <div v-for="r in results" :key="r.die + r.value + Math.random()"
                     class="flex flex-col items-center px-2 py-1 rounded-lg bg-black/60 border border-[#2a3340]">
                  <span class="text-[10px] font-bold text-slate-500 uppercase">{{ r.die }}</span>
                  <span class="text-lg font-black leading-tight" :class="valClass(r)">{{ r.value }}</span>
                </div>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
                <span class="font-cinzel font-black text-4xl leading-none"
                      :class="hasCrit ? 'text-yellow-300' : hasFail ? 'text-red-400' : 'text-omni'"
                      style="text-shadow: 0 0 20px currentColor">
                  {{ total }}
                </span>
              </div>
            </template>
          </div>
        </Transition>

        <!-- rolling indicator -->
        <div v-if="isRolling"
             class="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-10">
          <span class="text-xs font-bold tracking-[3px] uppercase text-omni/60 animate-pulse">rolling...</span>
        </div>

        <div class="absolute inset-0 pointer-events-none rounded-xl"
             style="box-shadow: inset 0 0 30px rgba(0,230,118,0.05); z-index:1" />
      </div>

      <!-- actions -->
      <div class="flex gap-2 px-3 py-3">
        <button
          class="flex-1 py-2.5 rounded-xl font-cinzel font-bold text-sm tracking-[2px] uppercase transition-all"
          :class="isRolling || totalCount === 0
            ? 'bg-[#0f1a0f] text-omni/30 border border-omni/10 cursor-not-allowed'
            : 'bg-omni-dim text-[#001a0d] hover:bg-omni active:scale-95'"
          :style="!isRolling && totalCount > 0 ? 'box-shadow: 0 0 20px rgba(0,200,83,0.35)' : ''"
          :disabled="isRolling || totalCount === 0"
          @click="rollAll"
        >
          {{ isRolling ? '⬡ Rolling...' : totalCount > 1 ? `⬡ Roll ${totalCount} Dice` : '⬡ Roll' }}
        </button>
        <button
          class="px-3 py-2.5 rounded-xl text-sm font-bold border border-[#3a4555] text-slate-400
                 hover:border-red-700 hover:text-red-400 transition-all active:scale-95"
          @click="clearQueue"
          title="Clear"
        >✕</button>
      </div>

      <!-- history -->
      <div v-if="history.length" class="px-3 pb-3 border-t border-[#1e2530] pt-2">
        <div class="text-[10px] font-bold uppercase tracking-[3px] text-slate-600 mb-1.5">History</div>
        <div class="flex flex-col gap-1">
          <div v-for="(h, i) in history" :key="h.ts"
               class="flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-semibold"
               :class="i === 0 ? 'bg-omni-dark border border-omni/30' : 'bg-[#0f1318] border border-[#1e2530]'">
            <span :class="i === 0 ? 'text-omni' : 'text-slate-400'">{{ h.label }}</span>
            <span :class="i === 0 ? 'text-white font-black' : 'text-slate-300 font-bold'">= {{ h.total }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.pop-enter-active { animation: pop 0.35s cubic-bezier(0.16,1,0.3,1); }
.pop-leave-active { transition: opacity 0.15s ease; }
.pop-leave-to    { opacity: 0; }
@keyframes pop {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
</style>
