export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
  action?: { label: string; to: string }
}

let seq = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function push(message: string, tone: Toast['tone'] = 'success', action?: Toast['action'], duration = 3800) {
    const id = ++seq
    toasts.value.push({ id, message, tone, action })
    if (import.meta.client) setTimeout(() => dismiss(id), duration)
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (m: string, a?: Toast['action']) => push(m, 'success', a),
    error: (m: string) => push(m, 'error', undefined, 6000),
    info: (m: string) => push(m, 'info'),
  }
}
