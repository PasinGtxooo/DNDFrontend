import { reactive } from 'vue'
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../composables/useFirebase.js'
import { useApi } from '../composables/useApi.js'
import { useToast } from '../composables/useToast.js'

const { toast } = useToast()
const api = useApi()

// Firestore path: DND/dice_results/{playerId}
const diceCol = () => collection(db, 'DND_dice_results')

export const store = reactive({
  players:      {},
  selectedId:   null,
  aliens:       {},
  masterAliens: {},
  characters:   {},
  sessions:     {},
  view:         'players',
  diceResults:  {},
  _diceUnsub:   null,

  get player() { return this.players[this.selectedId] ?? null },

  async broadcastDiceRoll(playerId, rollData) {
    this.diceResults[playerId] = rollData
    try { await setDoc(doc(diceCol(), playerId), rollData) } catch {}
  },

  listenDiceResults() {
    if (this._diceUnsub) return
    this._diceUnsub = onSnapshot(diceCol(), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') {
          delete this.diceResults[change.doc.id]
        } else {
          this.diceResults[change.doc.id] = change.doc.data()
        }
      })
    })
  },

  stopDiceListener() {
    if (this._diceUnsub) { this._diceUnsub(); this._diceUnsub = null }
  },

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

  // ── Story characters ──
  async loadCharacters() {
    try { this.characters = await api.getCharacters() }
    catch (e) { toast(e.message, 'error') }
  },
  async addCharacter(body) {
    await api.addCharacter(body)
    await this.loadCharacters()
    toast(`Character "${body.name}" created!`)
  },
  async patchCharacter(id, body) {
    await api.patchCharacter(id, body)
    await this.loadCharacters()
    toast('Character updated!')
  },
  async deleteCharacter(id) {
    await api.deleteCharacter(id)
    await this.loadCharacters()
    toast(`Character "${id}" deleted.`)
  },

  // ── Sessions ──
  async loadSessions() {
    try { this.sessions = await api.getSessions() }
    catch (e) { toast(e.message, 'error') }
  },
  async addSession(body) {
    await api.addSession(body)
    await this.loadSessions()
    toast(`Session ${body.session} created!`)
  },
  async patchSession(id, body) {
    await api.patchSession(id, body)
    await this.loadSessions()
    toast('Session updated!')
  },
  async deleteSession(id) {
    await api.deleteSession(id)
    await this.loadSessions()
    toast('Session deleted.')
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
