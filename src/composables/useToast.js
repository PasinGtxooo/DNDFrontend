import { reactive } from 'vue'

const toasts = reactive([])
let id = 0

export function useToast() {
  function show(msg, type = 'success') {
    const t = { id: id++, msg, type }
    toasts.push(t)
    setTimeout(() => {
      const i = toasts.findIndex(x => x.id === t.id)
      if (i !== -1) toasts.splice(i, 1)
    }, 3500)
  }
  return { toasts, toast: show }
}
