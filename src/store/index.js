import { reactive } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useToast } from '../composables/useToast.js'

const { toast } = useToast()
const api = useApi()

export const store = reactive({
  players:      {},
  selectedId:   null,
  aliens:       {},       // player's aliens
  masterAliens: {},       // master alien templates
  view:         'players', // 'players' | 'master'

  get player() { return this.players[this.selectedId] ?? null },

  // ── Players ──
  async loadPlayers() {
    try { this.players = await api.getPlayers() }
    catch (e) { toast(e.message, 'error') }
  },

  async selectPlayer(id) {
    this.selectedId = id
    await this.loadPlayerAliens(id)
  },

  async refreshPlayer() {
    if (!this.selectedId) return
    try { this.players[this.selectedId] = await api.getPlayer(this.selectedId) }
    catch (e) { toast(e.message, 'error') }
  },

  async addPlayer(body) {
    await api.addPlayer(body)
    await this.loadPlayers()
    toast(`Player "${body.name || body.player_id}" created!`)
  },

  async patchPlayer(body) {
    await api.patchPlayer(this.selectedId, body)
    await this.refreshPlayer()
    toast('Player updated!')
  },

  async deletePlayer(id) {
    await api.deletePlayer(id)
    if (this.selectedId === id) { this.selectedId = null; this.aliens = {} }
    await this.loadPlayers()
    toast(`Player "${id}" deleted.`)
  },

  async doTransform(alienId) {
    await api.transform(this.selectedId, { alien_id: alienId || null })
    await this.refreshPlayer()
    toast(alienId ? `Transformed → ${alienId}` : 'Reverted to human form')
  },

  // ── Player aliens ──
  async loadPlayerAliens(pid) {
    try { this.aliens = await api.getPlayerAliens(pid) }
    catch { this.aliens = {} }
  },

  async addPlayerAlien(body) {
    await api.addPlayerAlien(this.selectedId, body)
    await this.loadPlayerAliens(this.selectedId)
    toast(`Alien "${body.name || body.alien_id}" added to player!`)
  },

  async patchPlayerAlien(alienId, body) {
    await api.patchPlayerAlien(this.selectedId, alienId, body)
    await this.loadPlayerAliens(this.selectedId)
    toast('Alien updated!')
  },

  async deletePlayerAlien(alienId) {
    await api.deletePlayerAlien(this.selectedId, alienId)
    await this.loadPlayerAliens(this.selectedId)
    toast(`Alien "${alienId}" removed from player.`)
  },

  // ── Master aliens ──
  async loadMasterAliens() {
    try { this.masterAliens = await api.getMasterAliens() }
    catch (e) { toast(e.message, 'error') }
  },

  async addMasterAlien(body) {
    await api.addMasterAlien(body)
    await this.loadMasterAliens()
    toast(`Master alien "${body.name || body.alien_id}" created!`)
  },

  async patchMasterAlien(id, body) {
    await api.patchMasterAlien(id, body)
    await this.loadMasterAliens()
    toast('Master alien updated!')
  },

  async deleteMasterAlien(id) {
    await api.deleteMasterAlien(id)
    await this.loadMasterAliens()
    toast(`Master alien "${id}" deleted.`)
  },
})
