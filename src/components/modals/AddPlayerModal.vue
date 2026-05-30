<script setup>
import { reactive } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import { store } from '../../store/index.js'
import { useToast } from '../../composables/useToast.js'

const emit = defineEmits(['close'])
const { toast } = useToast()

const form = reactive({ player_id: '', name: '', level: '', xp: '', hp: '', hp_max: '' })

async function submit() {
  if (!form.player_id) return toast('Player ID is required', 'error')
  const body = {
    player_id: form.player_id,
    name: form.name || undefined,
    level: form.level !== '' ? Number(form.level) : undefined,
    xp:    form.xp    !== '' ? Number(form.xp)    : undefined,
    hp:    form.hp    !== '' ? Number(form.hp)    : undefined,
    hp_max:form.hp_max!== '' ? Number(form.hp_max): undefined,
  }
  try {
    await store.addPlayer(body)
    Object.assign(form, { player_id: '', name: '', level: '', xp: '', hp: '', hp_max: '' })
    emit('close')
  } catch (e) { toast(e.message, 'error') }
}
</script>

<template>
  <BaseModal title="Add New Player" @close="emit('close')">
    <div class="grid grid-cols-2 gap-3">
      <div class="col-span-2">
        <label class="label">Player ID</label>
        <input v-model="form.player_id" class="input" placeholder="e.g. ben10" />
      </div>
      <div class="col-span-2">
        <label class="label">Name</label>
        <input v-model="form.name" class="input" placeholder="e.g. Ben Tennyson" />
      </div>
      <div>
        <label class="label">Level</label>
        <input v-model="form.level" type="number" class="input" placeholder="1" />
      </div>
      <div>
        <label class="label">XP</label>
        <input v-model="form.xp" type="number" class="input" placeholder="0" />
      </div>
      <div>
        <label class="label">HP</label>
        <input v-model="form.hp" type="number" class="input" placeholder="20" />
      </div>
      <div>
        <label class="label">Max HP</label>
        <input v-model="form.hp_max" type="number" class="input" placeholder="20" />
      </div>
    </div>
    <template #actions>
      <button class="btn-outline btn" @click="emit('close')">Cancel</button>
      <button class="btn-primary btn" @click="submit">Create Player</button>
    </template>
  </BaseModal>
</template>
