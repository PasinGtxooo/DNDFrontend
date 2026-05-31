import { ref } from 'vue'

export const apiBase = ref('https://dnd-backend-chi.vercel.app')

async function call(method, path, body) {
  const res = await fetch(apiBase.value.replace(/\/$/, '') + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

export function useApi() {
  return {
    // Players
    getPlayers:        ()               => call('GET',    '/players'),
    getPlayer:         (id)             => call('GET',    `/player/${id}`),
    addPlayer:         (body)           => call('POST',   '/player', body),
    patchPlayer:       (id, body)       => call('PATCH',  `/player/${id}`, body),
    deletePlayer:      (id)             => call('DELETE', `/player/${id}`),
    transform:         (id, body)       => call('PATCH',  `/player/${id}/transform`, body),
    // Player aliens
    getPlayerAliens:   (pid)            => call('GET',    `/player/${pid}/aliens`),
    addPlayerAlien:    (pid, body)      => call('POST',   `/player/${pid}/alien`, body),
    patchPlayerAlien:  (pid, aid, body) => call('PATCH',  `/player/${pid}/alien/${aid}`, body),
    deletePlayerAlien: (pid, aid)       => call('DELETE', `/player/${pid}/alien/${aid}`),
    // Master aliens
    getMasterAliens:   ()               => call('GET',    '/aliens'),
    addMasterAlien:    (body)           => call('POST',   '/alien', body),
    patchMasterAlien:  (id, body)       => call('PATCH',  `/alien/${id}`, body),
    deleteMasterAlien: (id)             => call('DELETE', `/alien/${id}`),
    // Story characters
    getCharacters:     ()               => call('GET',    '/characters'),
    addCharacter:      (body)           => call('POST',   '/character', body),
    patchCharacter:    (id, body)       => call('PATCH',  `/character/${id}`, body),
    deleteCharacter:   (id)             => call('DELETE', `/character/${id}`),
    // Sessions
    getSessions:       ()               => call('GET',    '/sessions'),
    addSession:        (body)           => call('POST',   '/session', body),
    patchSession:      (id, body)       => call('PATCH',  `/session/${id}`, body),
    deleteSession:     (id)             => call('DELETE', `/session/${id}`),
  }
}
