import type { Ref } from 'vue'

export const useToken = () => useNuxtApp().$token as Ref<string | null>
