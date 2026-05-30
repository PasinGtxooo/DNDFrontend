<script setup>
const CHARACTERS = [
  // ── ALLIES ──────────────────────────────────────────────
  {
    id: 'tetrax',
    name: 'Tetrax Shard',
    species: 'Petrosapien (Diamondhead\'s species)',
    role: 'พี่เลี้ยง / ผู้สนับสนุนทีม',
    faction: 'ally',
    notes: [
      'ให้อุปกรณ์, วิเคราะห์ข้อมูล, ส่ง Mission',
      'มียานอวกาศลับ + ฐานใต้ดิน',
    ],
  },
  {
    id: 'myaxx',
    name: 'Myaxx',
    species: 'Chimera Sui Generis (Vilgax\'s species)',
    role: 'นักวิทยาศาสตร์ลี้ภัย / อดีตลูกน้อง Vilgax',
    faction: 'ally',
    notes: [
      'ให้ข้อมูล Vilgax Labs',
      'B สแกน DNA Vilgax จากเธอ',
    ],
  },
  {
    id: 'alpha',
    name: 'Alpha',
    species: 'สัตว์กลายพันธุ์',
    role: 'หัวหน้าฝูง (ปรับตัวแล้ว)',
    faction: 'ally',
    emoji: '🐺',
    notes: [
      'ถูกจับ Session 2 → รักษาหายแล้ว ไม่ดุร้าย',
      'อยู่ที่ฐาน Tetrax',
    ],
  },
  {
    id: 'dog4',
    name: 'Dog 4',
    species: 'สัตว์กลายพันธุ์',
    role: 'สมาชิกฝูง (ปรับตัวแล้ว)',
    faction: 'ally',
    emoji: '🐕',
    notes: [
      'ถูกจับ Session 2 → รักษาหายแล้ว ไม่ดุร้าย',
      'อยู่ที่ฐาน Tetrax',
    ],
  },

  // ── ENEMIES ─────────────────────────────────────────────
  {
    id: 'vilgax',
    name: 'Vilgax',
    species: 'Chimera Sui Generis',
    role: 'ตัวร้ายหลัก! ผู้พิชิตจักรวาล',
    faction: 'enemy',
    notes: [
      'กำลังสร้างสัตว์กลายพันธุ์บนโลกผ่าน V.I.L. Corporation',
      'ยังไม่เจอตัวจริง (แต่ B มี DNA ของเขา!)',
      'มีแล็บลับอีก 2 แห่งบนโลก',
    ],
  },
  {
    id: 'kraab',
    name: 'Kraab',
    species: 'Unknown (ปูยักษ์)',
    role: 'นักล่ารางวัล รับจ้าง Vilgax',
    faction: 'enemy',
    emoji: '🦀',
    status: 'ถูกจับ',
    notes: [
      'เคยอัพเกรดอาวุธมาสู้ทีม',
      'ถูกจับ Session 3 → ส่งให้ Plumbers แล้ว',
      'B ขโมยอาวุธไปหมด (Sniper, Missiles, Shield, Claw)',
    ],
  },
  {
    id: 'vilgax_robot',
    name: 'Vilgax Robot',
    species: 'หุ่นยนต์',
    role: 'หุ่นยนต์ของ Vilgax',
    faction: 'enemy',
    emoji: '🤖',
    status: 'ถูกทำลาย',
    notes: [
      'เจอ Session 1 ที่โกดังสารเคมี',
      'G ทำ EMP ทำลายไป',
    ],
  },
  {
    id: 'mutant_dogs',
    name: 'Mutant Dogs x4',
    species: 'สัตว์กลายพันธุ์',
    role: 'สัตว์กลายพันธุ์จาก Project CHIMERA',
    faction: 'enemy',
    emoji: '🐺',
    status: 'ส่วนใหญ่ตายแล้ว',
    notes: [
      'Dog 1, 2, 3: ตายใน Session 2',
      'Dog 4: จับได้ → รักษาหายแล้ว (ย้ายไป Ally แล้ว)',
    ],
  },
  {
    id: 'vilgax_drones',
    name: 'Vilgax Drones x3',
    species: 'หุ่นยนต์',
    role: 'ลูกน้องหุ่นยนต์ Vilgax',
    faction: 'enemy',
    emoji: '🤖',
    status: 'กำลังสู้อยู่!',
    hp: 35,
    ac: 16,
    notes: [
      'กำลังเจออยู่ตอนนี้!',
      'ไล่ตาม Kineceleran',
    ],
  },

  // ── UNKNOWN ─────────────────────────────────────────────
  {
    id: 'kineceleran',
    name: 'Kineceleran',
    species: 'Kineceleran (XLR8\'s species)',
    role: '??? ยังไม่รู้ฝ่าย',
    faction: 'unknown',
    emoji: '🦎',
    notes: [
      'บาดเจ็บ ตกยานมาในป่า',
      'บอกแค่ว่า Vilgax ไล่ตาม',
      'ตัวดีหรือตัวร้าย? ยังไม่รู้!',
    ],
  },
]

const factionLabel = { ally: '🟢 ALLIES', enemy: '🔴 ENEMIES', unknown: '❓ UNKNOWN' }
const factionOrder = ['ally', 'enemy', 'unknown']

const grouped = factionOrder.map(f => ({
  faction: f,
  label: factionLabel[f],
  chars: CHARACTERS.filter(c => c.faction === f),
}))

const factionBorder = {
  ally:    'border-emerald-500/50',
  enemy:   'border-red-500/50',
  unknown: 'border-yellow-500/50',
}
const factionBg = {
  ally:    'bg-emerald-950/30',
  enemy:   'bg-red-950/30',
  unknown: 'bg-yellow-950/20',
}
const factionText = {
  ally:    'text-emerald-400',
  enemy:   'text-red-400',
  unknown: 'text-yellow-400',
}
const factionBadge = {
  ally:    'bg-emerald-900/60 text-emerald-200 border-emerald-500/50',
  enemy:   'bg-red-900/60    text-red-200    border-red-500/50',
  unknown: 'bg-yellow-900/60 text-yellow-200 border-yellow-500/50',
}
const statusBadge = {
  'ถูกจับ':          'bg-orange-900/60 text-orange-200 border-orange-500/50',
  'ถูกทำลาย':        'bg-slate-800/80  text-slate-400  border-slate-600/50',
  'กำลังสู้อยู่!':   'bg-red-900/80    text-red-200    border-red-400/60 animate-pulse',
  'ส่วนใหญ่ตายแล้ว': 'bg-slate-800/80  text-slate-500  border-slate-600/50',
}
</script>

<template>
  <div class="p-4 sm:p-6 overflow-y-auto h-full">
    <div class="max-w-5xl mx-auto">

      <!-- page title -->
      <div class="mb-6">
        <h1 class="font-cinzel font-black text-2xl sm:text-3xl tracking-widest text-white">
          Story Characters
        </h1>
        <p class="text-sm text-slate-500 mt-1">ตัวละครทั้งหมดในเรื่อง</p>
      </div>

      <!-- faction groups -->
      <div v-for="group in grouped" :key="group.faction" class="mb-8">

        <!-- group header -->
        <div class="flex items-center gap-3 mb-3">
          <span class="font-cinzel font-black text-base sm:text-lg tracking-widest"
            :class="factionText[group.faction]">
            {{ group.label }}
          </span>
          <div class="flex-1 h-px" :class="factionBorder[group.faction]"
               style="background: currentColor; opacity: 0.3" />
          <span class="text-xs font-bold text-slate-500">{{ group.chars.length }} ตัวละคร</span>
        </div>

        <!-- cards grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="c in group.chars" :key="c.id"
            class="border rounded-xl overflow-hidden flex flex-col"
            :class="[factionBorder[group.faction], factionBg[group.faction]]"
            style="background: #0e1318"
          >
            <!-- card header -->
            <div class="px-4 pt-3 pb-2 border-b border-white/5">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="font-cinzel font-bold text-base text-white leading-tight">
                    {{ c.emoji ? c.emoji + ' ' : '' }}{{ c.name }}
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5 truncate">{{ c.species }}</div>
                </div>
                <!-- status badge -->
                <span v-if="c.status"
                  class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5"
                  :class="statusBadge[c.status] ?? 'bg-slate-800 text-slate-400 border-slate-600'">
                  {{ c.status }}
                </span>
                <span v-else
                  class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5"
                  :class="factionBadge[c.faction]">
                  {{ group.faction === 'ally' ? 'ALLY' : group.faction === 'enemy' ? 'ENEMY' : '???' }}
                </span>
              </div>
              <div class="text-xs font-semibold mt-1" :class="factionText[group.faction]">
                {{ c.role }}
              </div>
            </div>

            <!-- stats row (for enemies with hp/ac) -->
            <div v-if="c.hp != null || c.ac != null" class="flex gap-2 px-4 py-2 border-b border-white/5">
              <div v-if="c.hp != null"
                class="flex-1 bg-black/30 rounded-lg text-center py-1.5 border border-red-900/40">
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">HP</div>
                <div class="text-sm font-black text-red-300">{{ c.hp }}</div>
              </div>
              <div v-if="c.ac != null"
                class="flex-1 bg-black/30 rounded-lg text-center py-1.5 border border-blue-900/40">
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AC</div>
                <div class="text-sm font-black text-blue-300">{{ c.ac }}</div>
              </div>
            </div>

            <!-- notes -->
            <div class="px-4 py-2.5 flex-1">
              <ul class="space-y-1">
                <li v-for="note in c.notes" :key="note"
                  class="flex items-start gap-1.5 text-xs text-slate-400 leading-snug">
                  <span class="flex-shrink-0 mt-0.5 opacity-50">▸</span>
                  <span>{{ note }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
