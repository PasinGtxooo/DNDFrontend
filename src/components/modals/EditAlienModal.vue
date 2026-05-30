<script setup>
import { reactive, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import { store } from '../../store/index.js'
import { useToast } from '../../composables/useToast.js'

const props = defineProps({ alienId: String, isMaster: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const { toast } = useToast()

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
  <BaseModal :title="(isMaster ? '[Master] ' : '') + 'Edit Alien'" @close="emit('close')">
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
    <template #actions>
      <button class="btn-danger btn btn-sm mr-auto" @click="remove">🗑 Delete</button>
      <button class="btn-outline btn" @click="emit('close')">Cancel</button>
      <button class="btn-primary btn" @click="submit">Save Changes</button>
    </template>
  </BaseModal>
</template>
