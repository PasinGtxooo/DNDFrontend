<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { store } from '../../store/index.js'
import { useToast } from '../../composables/useToast.js'

const props = defineProps({ alienId: String, isMaster: { type: Boolean, default: false } })
const emit  = defineEmits(['close'])
const { toast } = useToast()

const imgError = ref(false)
watch(() => props.alienId, () => imgError.value = false)

const alien = computed(() =>
  props.isMaster ? store.masterAliens[props.alienId] : store.aliens[props.alienId]
)

const rankStyle = {
  SSS: 'bg-purple-900/70 text-purple-200 border-purple-500/60',
  S:   'bg-red-900/70    text-red-200    border-red-500/60',
  A:   'bg-yellow-900/70 text-yellow-200 border-yellow-500/60',
  B:   'bg-blue-900/70   text-blue-200   border-blue-500/60',
  C:   'bg-slate-700/70  text-slate-200  border-slate-500/50',
  D:   'bg-slate-800/70  text-slate-300  border-slate-600/50',
}

const f = reactive({
  name: '', hp: '', hp_max: '', ac: '', speed: '',
  STR: '', DEX: '', CON: '', INT: '', WIS: '', CHA: '',
  abilities: '', weaknesses: '', items: '',
})

watch(() => props.alienId, (id) => {
  const a = props.isMaster ? store.masterAliens[id] : store.aliens[id]
  if (!a) return
  f.name       = a.name      ?? ''
  f.hp         = a.hp        ?? ''
  f.hp_max     = a.hp_max    ?? ''
  f.ac         = a.ac        ?? ''
  f.speed      = a.speed     ?? ''
  f.STR        = a.STR       ?? ''
  f.DEX        = a.DEX       ?? ''
  f.CON        = a.CON       ?? ''
  f.INT        = a.INT       ?? ''
  f.WIS        = a.WIS       ?? ''
  f.CHA        = a.CHA       ?? ''
  f.abilities  = (a.abilities  || []).join(', ')
  f.weaknesses = (a.weaknesses || []).join(', ')
  f.items      = (a.items      || []).join(', ')
}, { immediate: true })

const n   = (v) => v !== '' ? Number(v) : null
const arr = (v) => v.split(',').map(s => s.trim()).filter(Boolean)

async function submit() {
  const body = {
    name: f.name || null,
    hp: n(f.hp), hp_max: n(f.hp_max), ac: n(f.ac), speed: n(f.speed),
    STR: n(f.STR), DEX: n(f.DEX), CON: n(f.CON),
    INT: n(f.INT), WIS: n(f.WIS), CHA: n(f.CHA),
    abilities: arr(f.abilities), weaknesses: arr(f.weaknesses), items: arr(f.items),
  }
  Object.keys(body).forEach(k => { if (body[k] === null) delete body[k] })
  try {
    if (props.isMaster) await store.patchMasterAlien(props.alienId, body)
    else                await store.patchPlayerAlien(props.alienId, body)
    emit('close')
  } catch (e) { toast(e.message, 'error') }
}

async function remove() {
  if (!confirm(`Delete "${props.alienId}"?`)) return
  try {
    if (props.isMaster) await store.deleteMasterAlien(props.alienId)
    else                await store.deletePlayerAlien(props.alienId)
    emit('close')
  } catch (e) { toast(e.message, 'error') }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3"
         @click.self="emit('close')">

      <div class="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden border border-[#2a3340]"
           style="background:#080b0e; box-shadow:0 0 60px rgba(0,230,118,0.1), 0 32px 80px rgba(0,0,0,0.8)">

        <!-- ── IMAGE HERO ── -->
        <div class="relative flex-shrink-0 overflow-hidden" style="height:220px">

          <img v-if="!imgError"
            :src="`/aliens/${alienId}.webp`"
            :alt="alien?.name"
            class="w-full h-full object-cover object-top"
            @error="imgError = true"
          />
          <div v-else class="w-full h-full flex items-center justify-center font-cinzel font-black text-6xl text-omni"
               style="background:radial-gradient(circle at 40% 35%,#003d1a,#001a0d)">
            {{ (alien?.name || alienId || '?').slice(0,2).toUpperCase() }}
          </div>

          <!-- gradient overlays -->
          <div class="absolute inset-0" style="background:linear-gradient(to top,#080b0e 0%,rgba(8,11,14,0.3) 60%,transparent 100%)"/>
          <div class="absolute inset-0" style="background:linear-gradient(to bottom,rgba(0,0,0,0.4) 0%,transparent 40%)"/>

          <!-- close btn -->
          <button class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 transition-all backdrop-blur-sm"
                  @click="emit('close')">✕</button>

          <!-- master badge -->
          <div v-if="isMaster"
               class="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950/80 text-blue-200 border border-blue-600/50 backdrop-blur-sm">
            ⬡ TEMPLATE
          </div>

          <!-- bottom info -->
          <div class="absolute bottom-0 inset-x-0 px-5 pb-4">
            <div class="flex items-end justify-between gap-3">
              <div>
                <div class="font-cinzel font-black text-2xl text-white leading-tight drop-shadow-lg">
                  {{ alien?.name || alienId }}
                </div>
                <div class="text-sm text-slate-400 font-medium mt-0.5">{{ alienId }}</div>
              </div>
              <span v-if="alien?.rank"
                class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-black border tracking-wider backdrop-blur-sm"
                :class="rankStyle[alien.rank] ?? rankStyle.D"
              >{{ alien.rank }}</span>
            </div>
          </div>
        </div>

        <!-- ── FORM ── -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-3">
              <label class="label">Name</label>
              <input v-model="f.name" class="input" />
            </div>
            <div><label class="label">HP</label><input v-model="f.hp" type="number" class="input" /></div>
            <div><label class="label">Max HP</label><input v-model="f.hp_max" type="number" class="input" /></div>
            <div><label class="label">AC</label><input v-model="f.ac" type="number" class="input" /></div>
            <div><label class="label">Speed</label><input v-model="f.speed" type="number" class="input" /></div>
            <div><label class="label">STR</label><input v-model="f.STR" type="number" class="input" /></div>
            <div><label class="label">DEX</label><input v-model="f.DEX" type="number" class="input" /></div>
            <div><label class="label">CON</label><input v-model="f.CON" type="number" class="input" /></div>
            <div><label class="label">INT</label><input v-model="f.INT" type="number" class="input" /></div>
            <div><label class="label">WIS</label><input v-model="f.WIS" type="number" class="input" /></div>
            <div><label class="label">CHA</label><input v-model="f.CHA" type="number" class="input" /></div>
            <div class="col-span-3">
              <label class="label">Abilities (comma separated)</label>
              <input v-model="f.abilities" class="input" />
            </div>
            <div class="col-span-3">
              <label class="label">Weaknesses (comma separated)</label>
              <input v-model="f.weaknesses" class="input" />
            </div>
            <div class="col-span-3">
              <label class="label">Items (comma separated)</label>
              <input v-model="f.items" class="input" />
            </div>
          </div>
        </div>

        <!-- ── ACTIONS ── -->
        <div class="flex items-center gap-2 px-5 py-4 border-t border-[#1e2530] flex-shrink-0">
          <button class="btn-danger btn btn-sm mr-auto" @click="remove">🗑 Delete</button>
          <button class="btn-outline btn" @click="emit('close')">Cancel</button>
          <button class="btn-primary btn" @click="submit">Save Changes</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
