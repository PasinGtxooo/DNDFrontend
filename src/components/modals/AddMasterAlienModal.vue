<script setup>
import { reactive } from 'vue'
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
    await store.addMasterAlien(body)
    Object.keys(f).forEach(k => f[k] = '')
    emit('close')
  } catch (e) { toast(e.message, 'error') }
}
</script>

<template>
  <BaseModal title="Create Master Alien Template" @close="emit('close')">
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
        <input v-model="f.abilities" class="input" placeholder="Super Strength, Wall Climbing" />
      </div>
      <div class="col-span-3">
        <label class="label">Weaknesses (comma separated)</label>
        <input v-model="f.weaknesses" class="input" placeholder="Fire, Sound" />
      </div>
      <div class="col-span-3">
        <label class="label">Items (comma separated)</label>
        <input v-model="f.items" class="input" placeholder="Shield, Sword" />
      </div>
    </div>
    <template #actions>
      <button class="btn-outline btn" @click="emit('close')">Cancel</button>
      <button class="btn-primary btn" @click="submit">Create Template</button>
    </template>
  </BaseModal>
</template>
