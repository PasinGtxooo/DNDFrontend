<script setup>
import { onMounted, ref, computed } from 'vue'
import { store } from '../store/index.js'
import { useToast } from '../composables/useToast.js'

const { toast } = useToast()
const showAdd  = ref(false)
const editChar = ref(null)

onMounted(() => store.loadCharacters())

const factionOrder = ['ally', 'enemy', 'unknown']
const factionLabel = { ally: '🟢 ALLIES', enemy: '🔴 ENEMIES', unknown: '❓ UNKNOWN' }
const factionText  = { ally: 'text-emerald-400', enemy: 'text-red-400', unknown: 'text-yellow-400' }
const factionBorder= { ally: 'border-emerald-500/40', enemy: 'border-red-500/40', unknown: 'border-yellow-500/40' }
const factionBg    = { ally: '#041208', enemy: '#120404', unknown: '#0e0c02' }
const factionBadge = {
  ally:    'bg-emerald-900/60 text-emerald-200 border-emerald-500/50',
  enemy:   'bg-red-900/60    text-red-200    border-red-500/50',
  unknown: 'bg-yellow-900/60 text-yellow-200 border-yellow-500/50',
}

const grouped = computed(() =>
  factionOrder.map(f => ({
    faction: f,
    label:   factionLabel[f],
    chars:   Object.entries(store.characters)
               .filter(([, c]) => c.faction === f)
               .sort(([,a],[,b]) => (a.name||'').localeCompare(b.name||'')),
  })).filter(g => g.chars.length > 0)
)

// ── add / edit form ──────────────────────────────────────
const FACTIONS = ['ally','enemy','unknown']
const form = ref(emptyForm())
function emptyForm() {
  return { character_id:'', name:'', faction:'ally', species:'', status:'', extra_info:'', image_url:'', hp:'', ac:'' }
}

function openAdd() { form.value = emptyForm(); showAdd.value = true }
function openEdit(id, c) {
  form.value = {
    character_id: id,
    name:       c.name       ?? '',
    faction:    c.faction    ?? 'ally',
    species:    c.species    ?? '',
    status:     c.status     ?? '',
    extra_info: c.extra_info ?? '',
    image_url:  c.image_url  ?? '',
    hp:         c.hp         ?? '',
    ac:         c.ac         ?? '',
  }
  editChar.value = id
}

async function submitAdd() {
  if (!form.value.character_id || !form.value.name) return toast('ID and Name required','error')
  const body = {
    character_id: form.value.character_id,
    name:       form.value.name,
    faction:    form.value.faction,
    species:    form.value.species || null,
    status:     form.value.status  || null,
    extra_info: form.value.extra_info || null,
    image_url:  form.value.image_url  || null,
    hp:         form.value.hp !== '' ? Number(form.value.hp) : null,
    ac:         form.value.ac !== '' ? Number(form.value.ac) : null,
  }
  await store.addCharacter(body)
  showAdd.value = false
}

async function submitEdit() {
  const body = {
    name:       form.value.name,
    faction:    form.value.faction,
    species:    form.value.species || null,
    status:     form.value.status  || null,
    extra_info: form.value.extra_info || null,
    image_url:  form.value.image_url  || null,
    hp:         form.value.hp !== '' ? Number(form.value.hp) : null,
    ac:         form.value.ac !== '' ? Number(form.value.ac) : null,
  }
  await store.patchCharacter(editChar.value, body)
  editChar.value = null
}

async function remove(id, name) {
  if (!confirm(`Delete "${name}"?`)) return
  await store.deleteCharacter(id)
}

const imgErrors = ref({})
function initials(name, id) {
  const n = (name || id || '?').trim().split(/[\s_-]+/)
  return n.length >= 2 ? (n[0][0]+n[1][0]).toUpperCase() : (name||id||'?').slice(0,2).toUpperCase()
}
</script>

<template>
  <div class="p-4 sm:p-6 overflow-y-auto h-full">
    <div class="max-w-5xl mx-auto">

      <!-- header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-cinzel font-black text-2xl sm:text-3xl tracking-widest text-white">Story Characters</h1>
          <p class="text-sm text-slate-500 mt-1">ตัวละครทั้งหมดในเรื่อง</p>
        </div>
        <button class="btn-primary btn" @click="openAdd">+ Add Character</button>
      </div>

      <p v-if="!Object.keys(store.characters).length" class="text-center text-slate-600 py-20 text-sm">
        ยังไม่มีตัวละคร — กด <strong class="text-slate-400">+ Add Character</strong> เพื่อเพิ่ม
      </p>

      <!-- faction groups -->
      <div v-for="group in grouped" :key="group.faction" class="mb-8">
        <div class="flex items-center gap-3 mb-3">
          <span class="font-cinzel font-black text-base sm:text-lg tracking-widest" :class="factionText[group.faction]">
            {{ group.label }}
          </span>
          <div class="flex-1 h-px opacity-20" :class="factionBorder[group.faction]" style="background:currentColor"/>
          <span class="text-xs font-bold text-slate-500">{{ group.chars.length }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div
            v-for="[id, c] in group.chars" :key="id"
            class="group border rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-150 hover:scale-[1.01]"
            :class="factionBorder[group.faction]"
            :style="`background:${factionBg[group.faction]}`"
            @click="openEdit(id, c)"
          >
            <!-- image -->
            <div class="relative overflow-hidden flex-shrink-0" style="height:160px">
              <img
                v-if="c.image_url && !imgErrors[id]"
                :src="c.image_url"
                :alt="c.name"
                class="w-full h-full object-cover object-top"
                @error="imgErrors[id] = true"
              />
              <div v-else
                class="w-full h-full flex items-center justify-center font-cinzel font-black text-4xl"
                :style="`background:radial-gradient(circle at 40% 35%,#1a1a1a,#0a0a0a); color:#4a5568`">
                {{ initials(c.name, id) }}
              </div>

              <!-- gradient -->
              <div class="absolute inset-x-0 bottom-0 h-16"
                   style="background:linear-gradient(to top,#000 0%,transparent 100%)" />

              <!-- faction badge -->
              <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black border"
                    :class="factionBadge[group.faction]">
                {{ group.faction === 'ally' ? 'ALLY' : group.faction === 'enemy' ? 'ENEMY' : '???' }}
              </span>

              <!-- hp/ac if enemy -->
              <div v-if="c.hp != null || c.ac != null" class="absolute top-2 right-2 flex gap-1">
                <span v-if="c.hp != null" class="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-950/80 text-red-300 border border-red-700/50">
                  HP {{ c.hp }}
                </span>
                <span v-if="c.ac != null" class="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-950/80 text-blue-300 border border-blue-700/50">
                  AC {{ c.ac }}
                </span>
              </div>

              <!-- name on image -->
              <div class="absolute bottom-0 inset-x-0 px-3 pb-2">
                <div class="font-cinzel font-bold text-sm text-white leading-tight drop-shadow-lg">{{ c.name }}</div>
                <div v-if="c.species" class="text-[11px] text-slate-400 mt-0.5">{{ c.species }}</div>
              </div>
            </div>

            <!-- body -->
            <div class="px-3 py-2.5 flex-1 flex flex-col gap-1.5">
              <!-- status -->
              <div v-if="c.status"
                class="inline-flex self-start items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                :class="factionBadge[group.faction]">
                {{ c.status }}
              </div>
              <!-- extra info -->
              <p v-if="c.extra_info" class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {{ c.extra_info }}
              </p>
            </div>

            <!-- delete -->
            <button
              class="opacity-0 group-hover:opacity-100 absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all text-xs bg-black/60 rounded-full z-10"
              @click.stop="remove(id, c.name)"
            >✕</button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Add / Edit modal -->
  <Teleport to="body">
    <div v-if="showAdd || editChar"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      @click.self="showAdd=false; editChar=null">
      <div class="bg-[#0e1318] border border-[#2a3340] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#2a3340]">
          <span class="font-cinzel font-bold text-base">{{ editChar ? 'Edit Character' : 'Add Character' }}</span>
          <button class="text-slate-500 hover:text-white text-lg" @click="showAdd=false; editChar=null">✕</button>
        </div>
        <div class="p-5 space-y-3">
          <div v-if="!editChar">
            <label class="label">Character ID</label>
            <input v-model="form.character_id" class="input" placeholder="e.g. tetrax" />
          </div>
          <div>
            <label class="label">Name</label>
            <input v-model="form.name" class="input" placeholder="Tetrax Shard" />
          </div>
          <div>
            <label class="label">Faction</label>
            <select v-model="form.faction" class="input">
              <option v-for="f in FACTIONS" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
          <div>
            <label class="label">Species</label>
            <input v-model="form.species" class="input" placeholder="Petrosapien" />
          </div>
          <div>
            <label class="label">Status</label>
            <input v-model="form.status" class="input" placeholder="At base Tetrax / Captured / ..." />
          </div>
          <div>
            <label class="label">Image URL</label>
            <input v-model="form.image_url" class="input" placeholder="/Img/characters/tetrax.webp" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">HP</label><input v-model="form.hp" type="number" class="input" /></div>
            <div><label class="label">AC</label><input v-model="form.ac" type="number" class="input" /></div>
          </div>
          <div>
            <label class="label">Extra Info</label>
            <textarea v-model="form.extra_info" class="input" rows="3" placeholder="ข้อมูลเพิ่มเติม..." />
          </div>
        </div>
        <div class="flex justify-end gap-2 px-5 pb-5">
          <button class="btn-outline btn" @click="showAdd=false; editChar=null">Cancel</button>
          <button class="btn-primary btn" @click="editChar ? submitEdit() : submitAdd()">
            {{ editChar ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
