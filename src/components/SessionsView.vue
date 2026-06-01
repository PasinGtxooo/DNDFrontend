<script setup>
import { onMounted, ref, computed } from 'vue'
import { store } from '../store/index.js'
import { useToast } from '../composables/useToast.js'

const { toast } = useToast()
const showAdd = ref(false)
const editId  = ref(null)
const page    = ref(0)   // index into sessionList

onMounted(() => store.loadSessions())

// เรียง session 1 → 4
const sessionList = computed(() =>
  Object.entries(store.sessions)
    .sort(([,a],[,b]) => (a.session ?? 0) - (b.session ?? 0))
)

const current   = computed(() => sessionList.value[page.value])
const total     = computed(() => sessionList.value.length)
const canPrev   = computed(() => page.value > 0)
const canNext   = computed(() => page.value < total.value - 1)

function prev() { if (canPrev.value) page.value-- }
function next() { if (canNext.value) page.value++ }

const playerList = computed(() => Object.entries(store.players))

// ── form ─────────────────────────────────────────────────
const toLines  = (arr) => (arr ?? []).join('\n')
const fromLines = (str) => str.split('\n').map(s => s.trim()).filter(Boolean)

function emptyForm() {
  return {
    session: '', title: '', summary: '',
    xp_gained: '', xp_total: '', level_after: '',
    missions_completed: '', key_events: '', loot: '', best_quotes: '',
    player_upgrades: {}, character_notes: {},
  }
}
const form = ref(emptyForm())
function setUpgrade(pid, val)  { form.value.player_upgrades[pid] = val }
function setCharNote(cid, val) { form.value.character_notes[cid] = val }

function openAdd() { form.value = emptyForm(); showAdd.value = true }
function openEdit(id, s) {
  form.value = {
    session:            s.session     ?? '',
    title:              s.title       ?? '',
    summary:            s.summary     ?? '',
    xp_gained:          s.xp_gained   ?? '',
    xp_total:           s.xp_total    ?? '',
    level_after:        s.level_after ?? '',
    missions_completed: toLines(s.missions_completed),
    key_events:         toLines(s.key_events),
    loot:               toLines(s.loot),
    best_quotes:        toLines(s.best_quotes),
    player_upgrades:    { ...(s.player_upgrades ?? {}) },
    character_notes:    { ...(s.character_notes ?? {}) },
  }
  editId.value = id
}

function buildBody() {
  const f = form.value
  return {
    session:            Number(f.session),
    title:              f.title       || null,
    summary:            f.summary     || null,
    xp_gained:          f.xp_gained   !== '' ? Number(f.xp_gained)   : null,
    xp_total:           f.xp_total    !== '' ? Number(f.xp_total)    : null,
    level_after:        f.level_after !== '' ? Number(f.level_after) : null,
    missions_completed: fromLines(f.missions_completed),
    key_events:         fromLines(f.key_events),
    loot:               fromLines(f.loot),
    best_quotes:        fromLines(f.best_quotes),
    player_upgrades:    f.player_upgrades,
    character_notes:    f.character_notes,
  }
}

async function submitAdd() {
  if (form.value.session === '') return toast('Session number required', 'error')
  await store.addSession(buildBody())
  showAdd.value = false
  page.value = sessionList.value.length - 1
}

async function submitEdit() {
  await store.patchSession(editId.value, buildBody())
  editId.value = null
}

async function remove(id, num) {
  if (!confirm(`Delete Session ${num}?`)) return
  await store.deleteSession(id)
  if (page.value >= sessionList.value.length) page.value = Math.max(0, sessionList.value.length - 1)
}
</script>

<template>
  <div class="flex h-full overflow-hidden">

    <!-- ── LEFT NAV ───────────────────────────── -->
    <div class="flex flex-col items-center justify-center gap-3 px-2 sm:px-4 border-r border-[#1e2a30] bg-surface flex-shrink-0"
         style="width:56px">
      <!-- session dots -->
      <button
        v-for="(item, i) in sessionList" :key="item[0]"
        class="w-7 h-7 rounded-full border-2 font-cinzel font-black text-xs transition-all"
        :class="i === page
          ? 'bg-omni border-omni text-black shadow-omni'
          : 'border-[#2a3340] text-slate-500 hover:border-omni hover:text-omni'"
        @click="page = i"
      >{{ item[1].session }}</button>

      <div class="h-px w-6 bg-[#2a3340] my-1" />

      <!-- prev / next arrows -->
      <button
        class="w-9 h-9 rounded-xl border flex items-center justify-center text-base transition-all"
        :class="canPrev ? 'border-[#2a3340] text-slate-300 hover:border-omni hover:text-omni' : 'border-[#1a2020] text-[#2a3340] cursor-default'"
        :disabled="!canPrev"
        @click="prev"
      >↑</button>
      <button
        class="w-9 h-9 rounded-xl border flex items-center justify-center text-base transition-all"
        :class="canNext ? 'border-[#2a3340] text-slate-300 hover:border-omni hover:text-omni' : 'border-[#1a2020] text-[#2a3340] cursor-default'"
        :disabled="!canNext"
        @click="next"
      >↓</button>
    </div>

    <!-- ── MAIN CONTENT ───────────────────────── -->
    <div class="flex-1 overflow-y-auto">

      <!-- empty state -->
      <div v-if="!sessionList.length" class="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
        <span class="text-4xl">📖</span>
        <p class="text-sm">ยังไม่มี session</p>
        <button class="btn-primary btn btn-sm" @click="openAdd">+ Add Session</button>
      </div>

      <!-- session page -->
      <template v-else-if="current">
        <div class="p-5 sm:p-8 max-w-2xl mx-auto">

          <!-- top bar -->
          <div class="flex items-start justify-between gap-4 mb-6">
            <div>
              <!-- session number chip -->
              <div class="inline-flex items-center gap-2 mb-2">
                <span class="font-cinzel font-black text-xs tracking-[4px] uppercase text-slate-500">SESSION</span>
                <span class="w-8 h-8 rounded-xl bg-omni-dark border border-omni-dim/50 flex items-center justify-center font-cinzel font-black text-omni text-base">
                  {{ current[1].session }}
                </span>
              </div>
              <h2 class="font-cinzel font-black text-2xl sm:text-3xl text-white leading-tight">
                {{ current[1].title || `Session ${current[1].session}` }}
              </h2>
            </div>
            <div class="flex gap-2 flex-shrink-0 pt-1">
              <button class="btn-outline btn btn-sm" @click="openEdit(current[0], current[1])">Edit</button>
              <button class="text-slate-600 hover:text-red-400 transition-colors px-2 text-sm"
                      @click="remove(current[0], current[1].session)">✕</button>
            </div>
          </div>

          <!-- divider -->
          <div class="h-px bg-gradient-to-r from-omni-dim/40 via-[#2a3340] to-transparent mb-6" />

          <!-- summary -->
          <div v-if="current[1].summary" class="mb-8">
            <div class="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-3">เนื้อเรื่อง</div>
            <p class="text-slate-300 leading-[1.9] text-[15px] whitespace-pre-line font-medium">
              {{ current[1].summary }}
            </p>
          </div>

          <!-- key events -->
          <div v-if="current[1].key_events?.length" class="mb-8">
            <div class="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-3">Key Events</div>
            <ul class="space-y-2">
              <li v-for="ev in current[1].key_events" :key="ev"
                class="flex items-start gap-2.5 text-sm text-slate-300">
                <span class="text-omni mt-1 flex-shrink-0 text-xs">▸</span>
                <span class="leading-relaxed">{{ ev }}</span>
              </li>
            </ul>
          </div>

          <!-- player upgrades -->
          <div v-if="current[1].player_upgrades && Object.keys(current[1].player_upgrades).length" class="mb-8">
            <div class="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-3">Player Upgrades</div>
            <div class="space-y-2">
              <div v-for="(upgrade, pid) in current[1].player_upgrades" :key="pid"
                class="flex items-start gap-3 rounded-xl px-4 py-3 border border-omni-dim/20 bg-omni-dark/10">
                <div class="w-9 h-9 rounded-lg bg-omni-dark border border-omni-dim/40 flex items-center justify-center font-cinzel font-black text-sm text-omni flex-shrink-0">
                  {{ (store.players[pid]?.name || pid).slice(0,1).toUpperCase() }}
                </div>
                <div>
                  <div class="text-sm font-bold text-white">{{ store.players[pid]?.name || pid }}</div>
                  <div class="text-sm text-omni mt-0.5 leading-snug">{{ upgrade }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- loot -->
          <div v-if="current[1].loot?.length" class="mb-8">
            <div class="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-3">Loot</div>
            <div class="flex flex-wrap gap-2">
              <span v-for="l in current[1].loot" :key="l"
                class="px-3 py-1 rounded-full text-xs font-semibold bg-[#0a1a0a] border border-[#1e3a1e] text-slate-300">
                {{ l }}
              </span>
            </div>
          </div>

          <!-- character notes -->
          <div v-if="current[1].character_notes && Object.keys(current[1].character_notes).length" class="mb-8">
            <div class="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-3">Character Notes</div>
            <div class="space-y-2">
              <div v-for="(note, cid) in current[1].character_notes" :key="cid"
                class="flex items-start gap-3 rounded-xl px-4 py-3 border border-[#1e2a1e] bg-[#080d08]">
                <div class="w-9 h-9 rounded-lg bg-[#0a1a0a] border border-[#1e3a1e] flex items-center justify-center font-cinzel font-black text-sm text-emerald-500 flex-shrink-0">
                  {{ (store.characters[cid]?.name || cid).slice(0,1).toUpperCase() }}
                </div>
                <div>
                  <div class="text-sm font-bold text-white">{{ store.characters[cid]?.name || cid }}</div>
                  <div class="text-sm text-slate-400 mt-0.5 leading-snug">{{ note }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- best quotes -->
          <div v-if="current[1].best_quotes?.length" class="mb-8">
            <div class="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-3">Best Quotes</div>
            <div class="space-y-2">
              <blockquote v-for="q in current[1].best_quotes" :key="q"
                class="border-l-2 border-omni-dim/50 pl-4 text-sm text-slate-400 italic leading-relaxed">
                {{ q }}
              </blockquote>
            </div>
          </div>

          <!-- xp row -->
          <div v-if="current[1].xp_gained != null" class="flex flex-wrap gap-3 pt-2 border-t border-[#1e2a30]">
            <div class="px-3 py-1.5 rounded-lg bg-[#0a1a0a] border border-[#1e3a1e] text-xs font-bold text-emerald-400">
              +{{ current[1].xp_gained }} XP
            </div>
            <div v-if="current[1].xp_total" class="px-3 py-1.5 rounded-lg bg-[#0a0f14] border border-[#1e2a3a] text-xs font-bold text-blue-400">
              Total {{ current[1].xp_total }} XP
            </div>
            <div v-if="current[1].level_after" class="px-3 py-1.5 rounded-lg bg-omni-dark/40 border border-omni-dim/30 text-xs font-bold text-omni">
              → Lv.{{ current[1].level_after }}
            </div>
          </div>

          <!-- add button -->
          <div class="mt-8 flex justify-end">
            <button class="btn-primary btn btn-sm" @click="openAdd">+ Add Session</button>
          </div>

        </div>
      </template>

    </div>
  </div>

  <!-- Add / Edit modal -->
  <Teleport to="body">
    <div v-if="showAdd || editId"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      @click.self="showAdd=false; editId=null">
      <div class="bg-[#0e1318] border border-[#2a3340] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#2a3340]">
          <span class="font-cinzel font-bold text-base">{{ editId ? 'Edit Session' : 'Add Session' }}</span>
          <button class="text-slate-500 hover:text-white text-lg" @click="showAdd=false; editId=null">✕</button>
        </div>
        <div class="p-5 space-y-4">
          <!-- session # + title -->
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Session #</label><input v-model="form.session" type="number" class="input" /></div>
            <div><label class="label">Title</label><input v-model="form.title" class="input" placeholder="The Hunt" /></div>
          </div>

          <!-- xp + level -->
          <div class="grid grid-cols-3 gap-3">
            <div><label class="label">XP Gained</label><input v-model="form.xp_gained" type="number" class="input" /></div>
            <div><label class="label">XP Total</label><input v-model="form.xp_total" type="number" class="input" /></div>
            <div><label class="label">Level After</label><input v-model="form.level_after" type="number" class="input" /></div>
          </div>

          <!-- summary -->
          <div>
            <label class="label">Summary</label>
            <textarea v-model="form.summary" class="input" rows="4" placeholder="สรุปเนื้อหา..." />
          </div>

          <!-- key events -->
          <div>
            <label class="label">Key Events <span class="text-slate-600 font-normal">(แต่ละบรรทัด = 1 event)</span></label>
            <textarea v-model="form.key_events" class="input font-mono text-xs" rows="5"
              placeholder="G ใช้ Grey Matter แฮค&#10;พบ Tetrax Shard&#10;..." />
          </div>

          <!-- missions completed -->
          <div>
            <label class="label">Missions Completed <span class="text-slate-600 font-normal">(แต่ละบรรทัด)</span></label>
            <textarea v-model="form.missions_completed" class="input font-mono text-xs" rows="2"
              placeholder="First Contact — Vilgax Robot&#10;Bounty Hunter" />
          </div>

          <!-- loot -->
          <div>
            <label class="label">Loot <span class="text-slate-600 font-normal">(แต่ละบรรทัด)</span></label>
            <textarea v-model="form.loot" class="input font-mono text-xs" rows="3"
              placeholder="Plasma Sniper Cannon&#10;Energy Shield Generator" />
          </div>

          <!-- player upgrades -->
          <div>
            <div class="label mb-2">Player Upgrades</div>
            <div v-for="[pid, p] in playerList" :key="pid" class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-bold text-slate-400 w-16 flex-shrink-0 truncate">{{ p.name || pid }}</span>
              <input :value="form.player_upgrades[pid] || ''" class="input flex-1 text-sm py-1.5"
                placeholder="upgrade..." @input="setUpgrade(pid, $event.target.value)" />
            </div>
          </div>

          <!-- character notes -->
          <div>
            <div class="label mb-2">Character Notes</div>
            <div v-for="[cid, c] in Object.entries(store.characters)" :key="cid" class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-bold text-slate-400 w-20 flex-shrink-0 truncate">{{ c.name || cid }}</span>
              <input :value="form.character_notes[cid] || ''" class="input flex-1 text-sm py-1.5"
                placeholder="note..." @input="setCharNote(cid, $event.target.value)" />
            </div>
          </div>

          <!-- best quotes -->
          <div>
            <label class="label">Best Quotes <span class="text-slate-600 font-normal">(แต่ละบรรทัด)</span></label>
            <textarea v-model="form.best_quotes" class="input font-mono text-xs" rows="2"
              placeholder='"ช่วยผมด้วยครับ!" — B' />
          </div>
        </div>
        <div class="flex justify-end gap-2 px-5 pb-5">
          <button class="btn-outline btn" @click="showAdd=false; editId=null">Cancel</button>
          <button class="btn-primary btn" @click="editId ? submitEdit() : submitAdd()">
            {{ editId ? 'Save' : 'Add Session' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
