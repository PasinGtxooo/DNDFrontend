<script setup>
import { reactive, computed, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import { store } from '../../store/index.js'
import { useToast } from '../../composables/useToast.js'

const emit = defineEmits(['close'])
const { toast } = useToast()

const f = reactive({
  alien_id: '', name: '', hp: '', hp_max: '', ac: '', speed: '',
  STR: '', DEX: '', CON: '', INT: '', WIS: '', CHA: '',
  abilities: '', weaknesses: '', items: '',
})

const masterIds = computed(() => Object.keys(store.masterAliens))

// เมื่อเลือก master template ให้ fill form
function onMasterPick(e) {
  const id = e.target.value
  if (!id) return
  const m = store.masterAliens[id]
  if (!m) return
  f.alien_id   = id
  f.name       = m.name      ?? ''
  f.hp         = m.hp        ?? ''
  f.hp_max     = m.hp_max    ?? ''
  f.ac         = m.ac        ?? ''
  f.speed      = m.speed     ?? ''
  f.STR        = m.STR       ?? ''
  f.DEX        = m.DEX       ?? ''
  f.CON        = m.CON       ?? ''
  f.INT        = m.INT       ?? ''
  f.WIS        = m.WIS       ?? ''
  f.CHA        = m.CHA       ?? ''
  f.abilities  = (m.abilities  || []).join(', ')
  f.weaknesses = (m.weaknesses || []).join(', ')
  f.items      = (m.items      || []).join(', ')
}

const n   = (v) => v !== '' ? Number(v) : undefined
const arr = (v) => v.split(',').map(s => s.trim()).filter(Boolean)

async function submit() {
  if (!f.alien_id) return toast('Alien ID is required', 'error')
  const body = {
    alien_id: f.alien_id, name: f.name || undefined,
    hp: n(f.hp), hp_max: n(f.hp_max), ac: n(f.ac), speed: n(f.speed),
    STR: n(f.STR), DEX: n(f.DEX), CON: n(f.CON),
    INT: n(f.INT), WIS: n(f.WIS), CHA: n(f.CHA),
    abilities: arr(f.abilities), weaknesses: arr(f.weaknesses), items: arr(f.items),
  }
  try {
    await store.addPlayerAlien(body)
    Object.keys(f).forEach(k => f[k] = '')
    emit('close')
  } catch (e) { toast(e.message, 'error') }
}
</script>

<template>
  <BaseModal title="Add Alien to Player" @close="emit('close')">
    <!-- master template picker -->
    <div class="mb-4 p-3 bg-omni-dark/40 border border-omni-dim/30 rounded-lg">
      <label class="label text-omni">Load from Master Template</label>
      <select class="input" @change="onMasterPick">
        <option value="">-- Pick a template (optional) --</option>
        <option v-for="id in masterIds" :key="id" :value="id">
          {{ store.masterAliens[id]?.name || id }}
        </option>
      </select>
      <p class="text-[11px] text-[#4a5568] mt-1.5">เลือก template เพื่อ fill ค่า base แล้ว override ได้</p>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="col-span-2">
        <label class="label">Alien ID</label>
        <input v-model="f.alien_id" class="input" placeholder="e.g. fourarms" />
      </div>
      <div>
        <label class="label">Name</label>
        <input v-model="f.name" class="input" placeholder="Four Arms" />
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
    <template #actions>
      <button class="btn-outline btn" @click="emit('close')">Cancel</button>
      <button class="btn-primary btn" @click="submit">Add Alien</button>
    </template>
  </BaseModal>
</template>
