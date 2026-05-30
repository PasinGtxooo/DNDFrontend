<script setup>
import { reactive, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import { store } from '../../store/index.js'
import { useToast } from '../../composables/useToast.js'

const emit = defineEmits(['close'])
const { toast } = useToast()

const form = reactive({ name: '', level: '', xp: '', hp: '', hp_max: '', CHA: '', omnitrix_slots: '' })

watch(() => store.player, (p) => {
  if (!p) return
  form.name           = p.name           ?? ''
  form.level          = p.level          ?? ''
  form.xp             = p.xp             ?? ''
  form.hp             = p.hp             ?? ''
  form.hp_max         = p.hp_max         ?? ''
  form.CHA            = p.CHA            ?? ''
  form.omnitrix_slots = p.omnitrix_slots ?? ''
}, { immediate: true })

async function submit() {
  const body = {}
  if (form.name)   body.name   = form.name
  if (form.level !== '') body.level  = Number(form.level)
  if (form.xp    !== '') body.xp     = Number(form.xp)
  if (form.hp    !== '') body.hp     = Number(form.hp)
  if (form.hp_max!== '') body.hp_max = Number(form.hp_max)
  if (form.CHA            !== '') body.CHA            = Number(form.CHA)
  if (form.omnitrix_slots !== '') body.omnitrix_slots = Number(form.omnitrix_slots)
  try {
    await store.patchPlayer(body)
    emit('close')
  } catch (e) { toast(e.message, 'error') }
}
</script>

<template>
  <BaseModal title="Edit Player" @close="emit('close')">
    <div class="grid grid-cols-2 gap-3">
      <div class="col-span-2">
        <label class="label">Name</label>
        <input v-model="form.name" class="input" />
      </div>
      <div>
        <label class="label">Level</label>
        <input v-model="form.level" type="number" class="input" />
      </div>
      <div>
        <label class="label">XP</label>
        <input v-model="form.xp" type="number" class="input" />
      </div>
      <div>
        <label class="label">HP</label>
        <input v-model="form.hp" type="number" class="input" />
      </div>
      <div>
        <label class="label">Max HP</label>
        <input v-model="form.hp_max" type="number" class="input" />
      </div>
      <div>
        <label class="label">CHA</label>
        <input v-model="form.CHA" type="number" class="input" />
      </div>
      <div>
        <label class="label">Omnitrix Slots</label>
        <input v-model="form.omnitrix_slots" type="number" class="input" min="1" />
      </div>
    </div>
    <template #actions>
      <button class="btn-outline btn" @click="emit('close')">Cancel</button>
      <button class="btn-primary btn" @click="submit">Save Changes</button>
    </template>
  </BaseModal>
</template>
