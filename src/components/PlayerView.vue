<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/index.js'
import HpBar from './ui/HpBar.vue'
import StatBox from './ui/StatBox.vue'
import OmnitrixPanel from './OmnitrixPanel.vue'
import AlienCard from './AlienCard.vue'
import EditPlayerModal from './modals/EditPlayerModal.vue'
import AddAlienModal from './modals/AddAlienModal.vue'
import EditAlienModal from './modals/EditAlienModal.vue'
import PlayerAvatar from './ui/PlayerAvatar.vue'

const showEditPlayer = ref(false)
const showAddAlien   = ref(false)
const editAlienId    = ref(null)
const newItem       = ref('')
const editingUpgrade = ref(false)
const upgradeText    = ref('')

function startEditUpgrade() {
  upgradeText.value = p.value?.upgrade ?? ''
  editingUpgrade.value = true
}
async function saveUpgrade() {
  await store.patchPlayer({ upgrade: upgradeText.value || null })
  editingUpgrade.value = false
}

async function addItem() {
  const item = newItem.value.trim()
  if (!item) return
  const updated = [...(p.value?.inventory || []), item]
  await store.patchPlayer({ inventory: updated })
  newItem.value = ''
}

async function removeItem(item) {
  const updated = (p.value?.inventory || []).filter(i => i !== item)
  await store.patchPlayer({ inventory: updated })
}

const p = computed(() => store.player)
const id = computed(() => store.selectedId)

const realAlienEntries = computed(() => Object.entries(store.aliens))
const omnitrixSlots    = computed(() => p.value?.omnitrix_slots ?? 0)
const emptySlotCount   = computed(() => Math.max(0, omnitrixSlots.value - realAlienEntries.value.length))
const alienEntries     = computed(() => [
  ...realAlienEntries.value,
  ...Array.from({ length: emptySlotCount.value }, (_, i) => [`__empty_${i+1}`, null]),
])
</script>

<template>
  <div class="p-6 overflow-y-auto h-full">
    <!-- header -->
    <div class="flex items-center justify-between mb-5 gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <PlayerAvatar :player-id="id" :name="p?.name" size="xl" />
        <div class="min-w-0">
          <h2 class="section-title truncate">{{ p?.name || id }}</h2>
          <p class="text-sm text-slate-400 font-medium mt-0.5">ID: {{ id }}</p>
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            <span class="tag-blue">Lv.{{ p?.level ?? '?' }}</span>
            <span class="tag-green">XP {{ p?.xp ?? 0 }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button class="btn-outline btn btn-sm" @click="showEditPlayer = true">Edit</button>
        <button class="btn-outline btn btn-sm" @click="store.refreshPlayer()">↻</button>
      </div>
    </div>

    <!-- Omnitrix -->
    <OmnitrixPanel />

    <!-- Player Stats -->
    <div class="card mb-4">
      <div class="card-title">Player Stats</div>
      <HpBar v-if="p?.hp != null && p?.hp_max" :hp="p.hp" :hp-max="p.hp_max" class="mb-4" />
      <div class="grid grid-cols-4 gap-2.5">
        <StatBox label="Level"  :value="p?.level" />
        <StatBox label="XP"     :value="p?.xp" />
        <StatBox label="HP"     :value="p?.hp" />
        <StatBox label="Max HP" :value="p?.hp_max" />
        <StatBox label="CHA"    :value="p?.CHA" />
      </div>

      <div v-if="p?.status_effects?.length" class="mt-4">
        <div class="text-[10px] font-semibold uppercase tracking-widest text-[#8a9ab0] mb-2">Status Effects</div>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="s in p.status_effects" :key="s" class="tag-red">{{ s }}</span>
        </div>
      </div>

      <!-- Upgrade -->
      <div class="mt-4">
        <div class="text-[10px] font-semibold uppercase tracking-widest text-[#8a9ab0] mb-2">Upgrade</div>
        <div v-if="!editingUpgrade">
          <div class="flex items-center gap-2">
            <span v-if="p?.upgrade" class="text-sm text-yellow-300 font-semibold flex-1">⚡ {{ p.upgrade }}</span>
            <span v-else class="text-xs text-slate-600 flex-1">— ยังไม่มี upgrade —</span>
            <button class="text-xs text-slate-500 hover:text-omni transition-colors" @click="startEditUpgrade">Edit</button>
          </div>
        </div>
        <div v-else class="flex gap-1.5">
          <input
            v-model="upgradeText"
            class="input flex-1 text-sm py-1.5"
            placeholder="Combat Training: First Strike..."
            @keydown.enter="saveUpgrade"
            @keydown.esc="editingUpgrade = false"
          />
          <button class="btn-primary btn btn-sm px-3" @click="saveUpgrade">Save</button>
          <button class="btn-outline btn btn-sm px-2" @click="editingUpgrade = false">✕</button>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] font-semibold uppercase tracking-widest text-[#8a9ab0]">Inventory</div>
        </div>
        <div class="flex flex-wrap gap-1.5 mb-2">
          <span v-if="!p?.inventory?.length" class="text-xs text-slate-600">— empty —</span>
          <span
            v-for="item in p?.inventory" :key="item"
            class="group flex items-center gap-1 tag-blue pr-1 cursor-default"
          >
            {{ item }}
            <button
              class="opacity-0 group-hover:opacity-100 text-blue-300/60 hover:text-red-400 text-[10px] leading-none transition-all ml-0.5"
              @click="removeItem(item)"
            >✕</button>
          </span>
        </div>
        <!-- add item -->
        <div class="flex gap-1.5">
          <input
            v-model="newItem"
            class="input flex-1 text-sm py-1.5"
            placeholder="เพิ่ม item..."
            @keydown.enter="addItem"
          />
          <button class="btn-primary btn btn-sm px-3" @click="addItem">+</button>
        </div>
      </div>
    </div>

    <!-- Aliens -->
    <div class="border-t border-border mt-2 pt-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="section-title">Aliens</div>
          <div class="text-xs text-[#8a9ab0] mt-0.5">
            Omnitrix unlocked forms
            <span v-if="omnitrixSlots > 0" class="ml-2 font-semibold"
              :class="realAlienEntries.length >= omnitrixSlots ? 'text-red-400' : 'text-omni'">
              {{ realAlienEntries.length }} / {{ omnitrixSlots }} slots
            </span>
          </div>
        </div>
        <button
          class="btn-primary btn btn-sm"
          :disabled="omnitrixSlots > 0 && realAlienEntries.length >= omnitrixSlots"
          :title="omnitrixSlots > 0 && realAlienEntries.length >= omnitrixSlots ? 'Omnitrix slots full' : ''"
          @click="showAddAlien = true"
        >+ Add Alien</button>
      </div>

      <p v-if="!alienEntries.length" class="text-center text-[#4a5568] text-sm py-12">
        No aliens unlocked yet.
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <AlienCard
          v-for="[aid, alien] in alienEntries"
          :key="aid"
          :alien-id="aid"
          :alien="alien"
          :is-active="p?.active_alien === aid"
          :is-empty-slot="alien === null"
          @edit="editAlienId = $event"
        />
      </div>
    </div>
  </div>

  <EditPlayerModal v-if="showEditPlayer" @close="showEditPlayer = false" />
  <AddAlienModal   v-if="showAddAlien"   @close="showAddAlien = false" />
  <EditAlienModal  v-if="editAlienId"    :alien-id="editAlienId" @close="editAlienId = null" />
</template>
